#!/usr/bin/env bash
# Start a local PostgreSQL instance (newest installed version) when Docker is unavailable.
# Port comes from DATABASE_URL in .env.local (default 5433).
# Also ensures PRD v2 schema + seed exist.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGDIR="${ROOT}/.pgdata"
if [[ -z "${PGBIN:-}" ]]; then
  PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
  PGBIN="${PGBIN:-/usr/lib/postgresql/14/bin}"
fi
export PATH="${PGBIN}:${PATH}"
export PGHOST=127.0.0.1
if [[ -z "${PGPORT:-}" && -f "$ROOT/.env.local" ]]; then
  PGPORT="$(grep -E '^DATABASE_URL=' "$ROOT/.env.local" | sed -nE 's#.*@[^:/]+:([0-9]+)/.*#\1#p' | tail -1)"
fi
export PGPORT="${PGPORT:-5433}"
export PGUSER=accesspath
# Use the built-in "postgres" DB (CREATE DATABASE may be restricted).
export PGDATABASE=postgres

if [[ ! -x "${PGBIN}/pg_ctl" ]]; then
  echo "PostgreSQL binaries not found at $PGBIN" >&2
  echo "Install postgresql-14 or start Docker: docker compose up -d" >&2
  exit 1
fi

mkdir -p "$PGDIR"

init_cluster() {
  echo "Initializing Postgres data directory at $PGDIR …"
  rm -rf "$PGDIR"
  mkdir -p "$PGDIR"
  initdb -D "$PGDIR" --auth=trust --username=accesspath
  {
    echo "listen_addresses = '127.0.0.1'"
    echo "unix_socket_directories = '$PGDIR'"
    echo "max_connections = 40"
  } >> "$PGDIR/postgresql.conf"
  echo "host all all 127.0.0.1/32 trust" >> "$PGDIR/pg_hba.conf"
  echo "host all all ::1/128 trust" >> "$PGDIR/pg_hba.conf"
}

start_server() {
  if pg_isready -h 127.0.0.1 -p "$PGPORT" -U accesspath >/dev/null 2>&1; then
    echo "Postgres already accepting connections on $PGPORT"
    return 0
  fi

  if [[ ! -f "$PGDIR/PG_VERSION" ]]; then
    init_cluster
  fi

  rm -f "$PGDIR/postmaster.pid" "$PGDIR/.s.PGSQL."* 2>/dev/null || true

  if ! pg_ctl -D "$PGDIR" -l "$PGDIR/pg.log" -o "-p $PGPORT" start -w; then
    echo "Start failed — checking log for corruption …" >&2
    if grep -q "could not locate a valid checkpoint record\|invalid resource manager ID\|data directory lock file is invalid" "$PGDIR/pg.log" 2>/dev/null; then
      echo "Corrupt cluster detected; reinitializing …" >&2
      init_cluster
      pg_ctl -D "$PGDIR" -l "$PGDIR/pg.log" -o "-p $PGPORT" start -w
    else
      tail -40 "$PGDIR/pg.log" >&2 || true
      exit 1
    fi
  fi

  pg_isready -h 127.0.0.1 -p "$PGPORT" -U accesspath
}

ensure_schema_and_seed() {
  local has_table
  has_table="$(psql -d postgres -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='assistance_programs';")"
  if [[ "$has_table" != "1" ]]; then
    echo "Applying PRD v2 schema (drizzle/0001_prd_v2.sql) …"
    psql -d postgres -v ON_ERROR_STOP=1 -f "$ROOT/drizzle/0001_prd_v2.sql"
  fi

  local prog_count
  prog_count="$(psql -d postgres -tAc "SELECT COUNT(*) FROM assistance_programs;" 2>/dev/null || echo 0)"
  if [[ "$prog_count" == "0" ]]; then
    echo "Seeding demo data …"
    (cd "$ROOT" && npm run db:seed)
  else
    echo "Schema OK — $prog_count programme(s) present"
  fi
}

start_server
ensure_schema_and_seed

echo ""
echo "DATABASE_URL should be: postgresql://accesspath@127.0.0.1:$PGPORT/postgres"
echo "Postgres is ready. Keep this instance running while you develop."

/**
 * Verify curated official URLs.
 * Fictional demo hosts (example.com) are accepted when the URL is well-formed
 * and the public root responds — deep demo paths intentionally 404.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { isNotNull } from "drizzle-orm";

import { getDb, getSql } from "../src/lib/db";
import { assistancePrograms, resources } from "../src/lib/db/schema";

const DEMO_HOSTS = new Set(["example.com", "www.example.com"]);

async function checkUrl(
  url: string,
): Promise<{
  ok: boolean;
  status: number | null;
  note?: string;
  error?: string;
}> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, status: null, error: "invalid URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, status: null, error: "URL must be http(s)" };
  }

  const isDemoHost = DEMO_HOSTS.has(parsed.hostname);
  const probeUrl = isDemoHost ? `${parsed.protocol}//${parsed.hostname}/` : url;

  try {
    const response = await fetch(probeUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    const ok = response.status >= 200 && response.status < 400;
    return {
      ok,
      status: response.status,
      note: isDemoHost
        ? "Fictional demo host — verified root reachability, not deep path"
        : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function main() {
  const db = getDb();
  const [resourceRows, programRows] = await Promise.all([
    db.select().from(resources),
    // Only published programmes are shown to people, so only they need a source.
    db
      .select()
      .from(assistancePrograms)
      .where(isNotNull(assistancePrograms.publishedAt)),
  ]);

  const targets: Array<{ kind: string; name: string; url: string | null }> = [
    ...resourceRows.map((row) => ({
      kind: "resource",
      name: row.name,
      url: row.officialUrl,
    })),
    ...programRows.map((row) => ({
      kind: "program",
      name: row.name,
      url: row.officialUrl,
    })),
  ];

  const missing = targets.filter((item) => !item.url);
  const withUrls = targets.filter(
    (item): item is { kind: string; name: string; url: string } =>
      Boolean(item.url),
  );

  const results = [];
  for (const item of withUrls) {
    const check = await checkUrl(item.url);
    results.push({ ...item, ...check });
  }

  const failed = results.filter((item) => !item.ok);
  console.log(
    JSON.stringify(
      {
        total: targets.length,
        withOfficialUrl: withUrls.length,
        missingOfficialUrl: missing.map((item) => `${item.kind}:${item.name}`),
        failed: failed.map((item) => ({
          name: item.name,
          url: item.url,
          status: item.status,
          error: item.error,
        })),
        checked: results.map((item) => ({
          name: item.name,
          url: item.url,
          ok: item.ok,
          note: item.note,
        })),
        ok: failed.length === 0 && missing.length === 0,
      },
      null,
      2,
    ),
  );

  if (failed.length > 0 || missing.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });

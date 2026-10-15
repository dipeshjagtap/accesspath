import { Badge } from "@/components/ui/badge";

const LABELS: Record<
  string,
  { text: string; variant: "success" | "warning" | "danger" | "secondary" }
> = {
  verified: { text: "Verified", variant: "success" },
  needs_review: { text: "Needs review", variant: "warning" },
  expired: { text: "Expired", variant: "danger" },
  unverified: { text: "Unverified", variant: "secondary" },
};

export function VerificationBadge({ status }: { status: string }) {
  const config = LABELS[status] ?? LABELS.unverified!;
  return (
    <Badge variant={config.variant} aria-label={`Verification status: ${config.text}`}>
      {config.text}
    </Badge>
  );
}

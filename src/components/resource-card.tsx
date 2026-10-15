import Link from "next/link";

import { VerificationBadge } from "@/components/verification-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicResource } from "@/modules/resources/types";

export function ResourceCard({ resource }: { resource: PublicResource }) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge status={resource.verificationStatus} />
          <Badge variant="outline">
            {resource.resourceType.replaceAll("_", " ")}
          </Badge>
          {resource.isFictionalDemo === "true" ? (
            <Badge variant="secondary">Fictional demo</Badge>
          ) : null}
        </div>
        <CardTitle className="text-xl">
          <Link
            href={`/resources/${resource.id}`}
            className="underline-offset-2 hover:underline"
          >
            {resource.name}
          </Link>
        </CardTitle>
        <CardDescription>{resource.region}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        <p>{resource.description}</p>
        <p className="text-muted-foreground">
          Source: {resource.sourceNotes}
        </p>
        {resource.lastVerifiedAt ? (
          <p className="text-xs text-muted-foreground">
            Last verified:{" "}
            {new Date(resource.lastVerifiedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

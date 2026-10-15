import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy notice",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy notice (demo)</CardTitle>
          <CardDescription>
            Read this before sharing personal details in the intake.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            AccessPath collects the minimum information needed to suggest next
            steps for mobility support: region, practical needs, and optional
            constraints you choose to share.
          </p>
          <p>
            We do not ask for a diagnosis by default, and we do not sell personal
            data or use case details for advertising.
          </p>
          <p>
            Nothing is shared with a partner organization unless you give
            explicit consent later in the journey. You can ask for correction or
            deletion of demo data.
          </p>
          <p>
            This hackathon build uses <strong>fictional demo data</strong>. Do
            not enter real health records, identity numbers, or exact home
            addresses.
          </p>
          <Button asChild>
            <Link href="/intake">I understand — continue to intake</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

import type { Metadata } from "next";

import { IntakeForm } from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Needs intake",
};

export default function IntakePage() {
  return (
    <main className="flex-1">
      <IntakeForm />
    </main>
  );
}

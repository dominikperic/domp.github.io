import { FadeIn } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Resume",
  description: "Resume and background for Dominik Peric.",
  path: "/resume",
});

export default function ResumePage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="Background"
          title="Resume"
          description="Experience, education, and skills."
        />
      </FadeIn>
    </PageShell>
  );
}

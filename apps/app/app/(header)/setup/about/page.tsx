import { AboutPageContent } from "@repo/ui/components/Content/AboutPageContent";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <AboutPageContent
      docsHref="/setup/docs"
      securityHref="https://casaboard.dev/security"
    />
  );
}

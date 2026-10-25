import { CTA } from "./cta";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Roadmap } from "./roadmap";
import { Why } from "./why";

export function HomePageContent() {
  return (
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Why />
        <HowItWorks />
        <Roadmap />
        <CTA />
      </div>
    </>
  );
}

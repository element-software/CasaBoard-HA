import { HomePageContent } from "./home/HomePageContent";
import { metadataForRoute } from "./lib/og/content";

export const metadata = metadataForRoute("home");

export default function HomePage() {
  return (
    <HomePageContent />
  );
}
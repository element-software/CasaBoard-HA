import { Footer } from "@repo/ui/components/Shared/Footer/index";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@repo/ui/components/Header/Header";
import { Providers } from "./providers";
import { cn } from "@heroui/react";

export const metadata = {
  title: "CasaBoard — Local-Only Home Assistant Dashboards",
  description:
    "Free, MIT-licensed, privacy-first dashboard builder for Home Assistant. Self-hosted via Docker Compose or HACS — no account, no cloud, no tracking.",
  metadataBase: new URL("https://casaboard.dev"),
  icons: {
    icon: "/icon.svg",
  },
  manifest: "./manifest.webmanifest",
  openGraph: {
    title: "CasaBoard — Local-Only Home Assistant Dashboards",
    description:
      "Free, open-source, privacy-first dashboards for Home Assistant. Docker Compose or HACS — no account, no tracking.",
    url: "https://casaboard.dev",
    siteName: "CasaBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CasaBoard — Local-Only Home Assistant Dashboards",
    description:
      "Free, open-source, privacy-first dashboards for Home Assistant. Docker Compose or HACS — no account, no tracking.",
  },
};

const inter = Inter({ subsets: ["latin"] });

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={cn(
          "bg-white",
          inter.className
        )}
      >
        <Providers>
          <Header />
          <main className="min-h-screen flex-1 -mt-32">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

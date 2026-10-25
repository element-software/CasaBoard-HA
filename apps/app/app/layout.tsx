import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@heroui/react";
import { IngressProvider } from "@repo/hooks/ingress";
import { getIngressPrefix } from "@repo/lib/ingress/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CasaBoard — Dashboard",
  description: "CasaBoard Dashboard",
  icons: {
    icon: "/icon.svg",
  },
  manifest: "./manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ingressPrefix = await getIngressPrefix();

  return (
    <html lang="en" className="light">
      <body className={cn("bg-white", inter.className)}>
        <IngressProvider prefix={ingressPrefix}>{children}</IngressProvider>
      </body>
    </html>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { GITHUB_REPO_URL, LinkService } from "@repo/lib";
import { CasaBoardLogo } from "../../Logo/index";


export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-100 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <CasaBoardLogo size="small" />
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href={LinkService.crossAppHref("public", "/about")}
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              About
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href={LinkService.crossAppHref("public", "/security")}
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              Security
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href="/privacy"
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              Privacy Policy
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href="/cookies"
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              Cookie Policy
            </Link>
            <span className="opacity-30">•</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              GitHub
            </a>
            <span className="opacity-30">•</span>
            <a
              href="mailto:support@casaboard.dev"
              className="text-theme-text-secondary hover:text-theme-primary"
            >
              support@casaboard.dev
            </a>
          </nav>
        </div>

        <div className="mt-6 text-xs text-theme-text-secondary text-center">
          © {year} CasaBoard. MIT licensed. Free, open source, and self-hosted. Powered by{" "}
          <a
            href="https://element-software.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-primary"
          >
            Element Software
          </a>{" "}
          and{" "}
          <a
            href="https://element-connect.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-primary"
          >
            Element Connect
          </a>
        </div>
      </div>
    </footer>
  );
};

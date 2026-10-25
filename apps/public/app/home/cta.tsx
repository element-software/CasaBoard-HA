"use client"
import { Button, Link } from "@heroui/react";
import { Icon } from "@mdi/react";
import { mdiArrowRight, mdiGithub } from "@mdi/js";
import { GITHUB_REPO_URL } from "../lib/site";

export const CTA = () => {
  return (
    <div className="text-center">
      <div className="bg-violet-700 rounded-2xl p-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Ready to Get Started?
        </h2>
        <p className="text-center text-violet-200 text-lg mb-8 max-w-2xl mx-auto">
          Free, MIT-licensed, and self-hosted. Install with Docker Compose, optionally
          embed via HACS — no account, no tracking, no cost.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-violet-700 font-semibold px-8 hover:bg-violet-50"
            endContent={<Icon path={mdiArrowRight} className="w-5 h-5" />}
            href="/docs"
            as={Link}
          >
            Read the docs
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="border-white/40 text-white font-semibold px-8 hover:bg-white/10"
            startContent={<Icon path={mdiGithub} className="w-5 h-5" />}
            href={GITHUB_REPO_URL}
            as={Link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

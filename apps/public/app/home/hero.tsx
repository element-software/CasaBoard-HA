"use client";
import { Button, Chip, Link } from "@heroui/react";
import { Icon } from "@mdi/react";
import { mdiArrowRight, mdiGithub } from "@mdi/js";
import { GITHUB_REPO_URL } from "../lib/site";

export const Hero = () => {
  return (
    <div className="text-center pb-20 bg-gradient-to-b from-violet-50 via-violet-50/30 to-white px-8 pt-48 w-full">
      <div className="flex justify-center mb-6">
        <Chip
          variant="flat"
          className="bg-violet-100 text-violet-700 font-medium px-2"
          size="sm"
        >
          Local-only · Privacy-first · MIT
        </Chip>
      </div>
      <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
        <span className="bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
          CasaBoard
        </span>
      </h1>
      <p className="text-2xl md:text-3xl font-medium text-slate-700 mb-5 max-w-2xl mx-auto leading-snug">
        Beautiful smart home dashboards for Home Assistant
      </p>
      <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
        Free, open-source dashboard builder you run yourself. Drag-and-drop editing,
        Docker Compose or HACS — no account, no cloud, no tracking.
      </p>
      <p className="text-xs pb-8 text-slate-400 max-w-xl mx-auto">
        MIT licensed on GitHub — your Home Assistant data never leaves your network.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          size="lg"
          color="primary"
          className="font-semibold px-8 shadow-lg shadow-violet-200"
          endContent={<Icon path={mdiArrowRight} className="w-5 h-5" />}
          href="/docs"
          as={Link}
        >
          Get Started
        </Button>
        <Button
          size="lg"
          variant="bordered"
          className="font-semibold px-8 border-slate-200 text-slate-700"
          startContent={<Icon path={mdiGithub} className="w-5 h-5" />}
          href={GITHUB_REPO_URL}
          as={Link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </Button>
      </div>
    </div>
  );
};

"use client";

import { sections } from "./docsSections";
import { DocsSidebar } from "./DocsSidebar";
import { useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";

export const DocsWrapper = () => {
  const [index, setIndex] = useState(0);
  const current = sections[index];
  const prevSection = index > 0 ? sections[index - 1] : null;
  const nextSection = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 pt-8">
      <div className="flex gap-10">
        <DocsSidebar index={index} setIndex={setIndex} total={sections.length} />

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-8 text-xs text-slate-400">
            <span>Docs</span>
            <Icon path={mdiChevronRight} className="w-3 h-3" />
            <span className="text-slate-600 font-medium">{current.title}</span>
          </div>

          {/* Section content */}
          <current.Content />

          {/* Bottom prev/next */}
          <div className="mt-14 pt-8 border-t border-slate-100 flex items-stretch justify-between gap-4">
            {prevSection ? (
              <button
                onClick={() => { setIndex(index - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-all text-left"
              >
                <Icon path={mdiChevronLeft} className="w-5 h-5 text-slate-300 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5 font-medium uppercase tracking-wide">Previous</p>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">{prevSection.title}</p>
                </div>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => { setIndex(index + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-all text-right ml-auto"
              >
                <div>
                  <p className="text-xs text-slate-400 mb-0.5 font-medium uppercase tracking-wide">Next</p>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">{nextSection.title}</p>
                </div>
                <Icon path={mdiChevronRight} className="w-5 h-5 text-slate-300 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
              </button>
            ) : <div />}
          </div>
        </main>
      </div>
    </div>
  );
};

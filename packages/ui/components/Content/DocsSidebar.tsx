"use client";
import { cn } from "@heroui/react";
import { sections } from "./docsSections";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

export interface DocsSidebarProps {
  index: number;
  setIndex: (index: number) => void;
  total: number;
}

export const DocsSidebar = ({ index, setIndex, total }: DocsSidebarProps) => {
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <aside className="hidden md:block w-56 flex-shrink-0">
      <div className="sticky top-28 space-y-5">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
            <span className="text-[10px] font-semibold text-violet-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">{index + 1} of {total} completed</p>
        </div>

        {/* Nav */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contents</p>
          <nav className="space-y-0.5">
            {sections.map((s, i) => {
              const isDone = i < index;
              const isActive = i === index;
              return (
                <button
                  key={s.slug}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-left transition-all",
                    isActive
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : isDone
                      ? "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all",
                    isActive ? "bg-violet-600 text-white shadow-sm shadow-violet-200" :
                    isDone ? "bg-green-100 text-green-600" :
                    "bg-slate-100 text-slate-400"
                  )}>
                    {isDone ? <Icon path={mdiCheck} className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="leading-tight text-xs">{s.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

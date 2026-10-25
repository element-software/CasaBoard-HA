"use client";
import { useEffect, useState } from "react";

export type ClockAlign = "left" | "center" | "right";
export type ClockHourFormat = "12" | "24" | "auto";

export type ClockProps = {
  align?: ClockAlign;
  hourFormat?: ClockHourFormat;
};

const alignClassMap: Record<ClockAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const Clock = ({ align = "left", hourFormat = "auto" }: ClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hour12 =
    hourFormat === "auto" ? undefined : hourFormat === "12";

  const timeLabel = time.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(hour12 !== undefined ? { hour12 } : {}),
  });

  const dateLabel = time.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`w-full pt-1 pb-2 text-theme-text ${alignClassMap[align]}`}
    >
      <div className="text-5xl font-bold tracking-tight tabular-nums leading-none">
        {timeLabel}
      </div>
      <div className="text-base text-theme-text-secondary mt-1.5 font-medium">
        {dateLabel}
      </div>
    </div>
  );
};

export default Clock;

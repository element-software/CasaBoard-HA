"use client";

/** Simple section heading for Favorites / Rooms labels in the editor. */
export function SectionHeader({
  title = "Favorites",
}: {
  title?: string;
}) {
  return (
    <h2 className="text-2xl font-bold text-theme-text tracking-tight w-full">
      {title}
    </h2>
  );
}

export default SectionHeader;

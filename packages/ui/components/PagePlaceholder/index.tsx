"use client";

/** Empty / shell page content for Media, Cameras, Insights, etc. */
export function PagePlaceholder({
  title = "Coming soon",
  description = "This section is ready for your layout. Add components in the page editor.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-center gap-2 py-16 px-2 w-full">
      <h1 className="text-3xl font-bold text-theme-text tracking-tight">
        {title}
      </h1>
      <p className="text-theme-text-secondary max-w-md">{description}</p>
    </div>
  );
}

export default PagePlaceholder;

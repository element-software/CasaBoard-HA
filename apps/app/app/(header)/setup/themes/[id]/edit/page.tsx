import { getTheme } from "@repo/lib/actions/themeActions";
import { notFound } from "next/navigation";
import { ThemeEditorFormClient } from "./ThemeEditorFormClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ThemeEditPage({ params }: Props) {
  const { id } = await params;
  try {
    const theme = await getTheme(id);
    return <ThemeEditorFormClient theme={theme} />;
  } catch {
    notFound();
  }
}

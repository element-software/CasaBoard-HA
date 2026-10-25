import {
  PageActions,
  resolveDashboardThemeStyles,
  resolveDashboardStyle,
} from "@repo/lib";
import { DashboardHAClient } from "@repo/ui/components/Shared/util/DashboardHAClient";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    page: string;
  }>;
}

export default async function ConfigurablePage({ params }: PageProps) {
  const { page } = await params;

  try {
    const pageData = await PageActions.getPageBySlug(page);

    if (!pageData) {
      notFound();
    }

    const themeStyles = await resolveDashboardThemeStyles(pageData);
    const styleResult = resolveDashboardStyle(pageData);

    return (
      <DashboardHAClient
        page={pageData}
        pageSlug={page}
        themeMainStyle={themeStyles.main}
        themeSidebarStyle={themeStyles.sidebar}
        styleMainId={styleResult.mainId}
        styleMainVars={styleResult.main}
        styleSidebarId={styleResult.sidebarId}
        styleSidebarVars={styleResult.sidebar}
      />
    );
  } catch (error) {
    console.error("Error fetching page:", error);
    notFound();
  }
}

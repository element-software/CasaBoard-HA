import { type DashboardConfig } from '@repo/config';
import { dashboardConfig as defaultConfig } from '@repo/config';
import { getAllPages } from '../actions/pageActions';
import { serverLogger } from "@repo/lib";

export async function getServerConfig(): Promise<DashboardConfig> {
  try {
    const pages = await getAllPages();
    return {
      ...defaultConfig,
      pages: pages.reduce((acc, page) => {
        acc[page.slug] = {
          title: { showTitle: true, value: page.name },
          layout: [], // Pages use puck_data instead of layout
          puckData: page.puck_data,
          sidebar: undefined // No sidebar config in current schema
        };
        return acc;
      }, {} as Record<string, any>)
    };
  } catch (error) {
    serverLogger.warn('configService.load', 'Failed to load configuration, using default', error);
    return defaultConfig;
  }
}

import { DashboardConfig } from "./dashboard.types";

// Default configuration structure - pages will be created dynamically
export const dashboardConfig: DashboardConfig = {
  pages: {},
  global: {
    theme: "dark",
    enableThemeSwitch: true,
    defaultIcons: {
      light: "mdiLightbulb",
      alarm: "mdiShieldHome",
      binary_sensor: "mdiSensorOn",
      sensor: "mdiGauge",
    },
  },
};

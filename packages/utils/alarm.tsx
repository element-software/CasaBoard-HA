import { alarmBackgroundClass } from "./entityTheme";

export const stateClassNameBg = (entity: any) => {
  return alarmBackgroundClass(String(entity?.state ?? ""));
};

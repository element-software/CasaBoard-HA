export const stateClassNameIcon = (entity: any) => {
  switch (entity.state) {
    case "on":
      return "text-theme-primary";
    case "off":
      return "text-theme-secondary";
    default:
      return "text-theme-primary";
  }
};
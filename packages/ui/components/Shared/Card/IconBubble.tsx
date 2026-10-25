import type { ReactNode } from "react";

export interface IconBubbleProps {
  icon: ReactNode;
  label?: ReactNode;
  secondary?: ReactNode;
}

/**
 * Shared icon+label composition. The row/column layout swap between "Style"
 * presets (e.g. HomeKit stacks icon above label) is expressed in CSS against
 * this fixed markup skeleton, not as a branch in this component.
 */
export function IconBubble({ icon, label, secondary }: IconBubbleProps) {
  return (
    <div className="icon-bubble-row">
      <div className="icon-bubble">{icon}</div>
      {(label || secondary) && (
        <div className="icon-bubble-label flex flex-col min-w-0">
          {label && (
            <h3 className="text-sm font-semibold capitalize truncate">
              {label}
            </h3>
          )}
          {secondary && (
            <div className="icon-bubble-secondary text-xs font-medium opacity-80">
              {secondary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

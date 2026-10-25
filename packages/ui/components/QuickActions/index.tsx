"use client";
import { Chip } from '@heroui/react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiWeb,
  mdiHomeAssistant,
  mdiAlertCircle,
  mdiArrowRight,
  mdiPaletteSwatch,
  mdiSwapHorizontal,
} from '@mdi/js';
import { cn } from '@heroui/react';
import { useAppRouter, useHAConnection } from '@repo/hooks';

interface QuickAction {
  href: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  hoverBg: string;
  disabled?: boolean;
  disabledReason?: string;
}

export const QuickActions = () => {
  const { push } = useAppRouter();
  const { connection } = useHAConnection();

  const quickActions: QuickAction[] = [
    {
      href: '/setup/pages/create',
      icon: mdiPlus,
      title: 'Create Page',
      description: 'Build a new dashboard page',
      gradient: 'from-violet-500 to-purple-600',
      hoverBg: 'hover:bg-violet-50',
      disabled: !connection,
      disabledReason: 'Connect Home Assistant first',
    },
    {
      href: '/setup/pages',
      icon: mdiWeb,
      title: 'All Pages',
      description: 'View and manage every page',
      gradient: 'from-blue-500 to-indigo-600',
      hoverBg: 'hover:bg-blue-50',
    },
    {
      href: '/setup/themes',
      icon: mdiPaletteSwatch,
      title: 'Themes',
      description: 'Custom colors for dashboards and sidebars',
      gradient: 'from-fuchsia-500 to-pink-600',
      hoverBg: 'hover:bg-fuchsia-50',
    },
    {
      href: '/setup/ha-config',
      icon: mdiHomeAssistant,
      title: 'HA Settings',
      description: 'Configure Home Assistant',
      gradient: 'from-teal-500 to-emerald-600',
      hoverBg: 'hover:bg-teal-50',
    },
    {
      href: '/setup/settings',
      icon: mdiSwapHorizontal,
      title: 'Import / Export',
      description: 'Back up or restore your settings',
      gradient: 'from-amber-500 to-orange-600',
      hoverBg: 'hover:bg-amber-50',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) {
      if (action.href === '/setup/pages/create') push('/onboarding');
      return;
    }
    push(action.href);
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
        <p className="text-sm text-slate-500">Common tasks and shortcuts</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickActions.map((action) => (
          <button
            key={action.href}
            type="button"
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={cn(
              "group relative text-left rounded-2xl p-5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              action.disabled
                ? "bg-slate-50 cursor-not-allowed opacity-50"
                : cn("bg-white shadow-sm border border-slate-100 cursor-pointer", action.hoverBg, "hover:shadow-md hover:border-transparent")
            )}
          >
            {/* Gradient icon */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-sm",
                action.disabled ? "from-slate-300 to-slate-400" : action.gradient
              )}
            >
              <Icon path={action.icon} className="w-5 h-5 text-white" />
            </div>

            {/* Text */}
            <p className={cn(
              "font-semibold text-sm mb-0.5",
              action.disabled ? "text-slate-400" : "text-slate-900"
            )}>
              {action.title}
            </p>
            <p className={cn(
              "text-xs leading-relaxed",
              action.disabled ? "text-slate-400" : "text-slate-500"
            )}>
              {action.description}
            </p>

            {/* Arrow or warning */}
            {action.disabled ? (
              <div className="mt-3 flex items-center gap-1">
                <Icon path={mdiAlertCircle} className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600">{action.disabledReason}</span>
              </div>
            ) : (
              <div className="mt-4">
                <Icon
                  path={mdiArrowRight}
                  className="w-4 h-4 text-slate-400 transition-all duration-200 group-hover:text-slate-700 group-hover:translate-x-1"
                />
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

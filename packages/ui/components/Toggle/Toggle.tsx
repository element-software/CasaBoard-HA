import { Switch } from '@heroui/react'
import classNames from 'classnames'

interface ToggleProps {
  className?: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export const Toggle = ({ className, enabled, onToggle }: ToggleProps) => {

  return (
    <Switch
      isSelected={enabled}
      onValueChange={onToggle}
      size="lg"
      color="primary"
      className={className}
      classNames={{
        wrapper: classNames(
          'h-8 w-20 rounded-2xl',
          {
            'bg-gradient-to-r from-primary to-secondary': enabled,
            'bg-default-200': !enabled
          }
        ),
        thumb: 'w-7 h-7 rounded-2xl bg-white shadow-lg',
        label: 'text-small',
      }}
      startContent={
        <span className="text-xs font-medium text-white pl-2">
          {enabled ? 'On' : ''}
        </span>
      }
      endContent={
        <span className="text-xs font-medium text-default-500 pr-2">
          {!enabled ? 'Off' : ''}
        </span>
      }
    />
  )
}
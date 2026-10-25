import React from 'react';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { EntityIconsUtils } from '@repo/utils';

interface EntityIconProps {
  entity: any;
  className?: string;
  size?: string;
  style?: React.CSSProperties;
}

/**
 * Universal entity icon component that renders the correct icon for any entity
 */
export default function EntityIcon({ entity, className, size = 'h-10 w-10', style }: EntityIconProps) {
  const iconConfig = EntityIconsUtils.getEntityIcon(entity);
  
  return (
    <Icon 
      path={iconConfig.path} 
      className={classNames(size, className || iconConfig.className)}
      style={style}
    />
  );
}

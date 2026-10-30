import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { type IconName, iconRegistry } from './registry';
import styles from './icon.module.css';

export interface IconProps extends Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'> {
  name: IconName;
  /** Accessible name. Omit for decorative icons. */
  label?: string;
}

export function Icon({
  name,
  label,
  size = '1em',
  strokeWidth = 1.5,
  className,
  ...props
}: IconProps) {
  const { svg, mirror } = iconRegistry[name];

  return (
    <HugeiconsIcon
      icon={svg}
      size={size}
      strokeWidth={strokeWidth}
      className={cn(styles.icon, mirror && styles.mirror, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    />
  );
}

'use client';

import React from 'react';
import { useDirection } from './i18n-provider';

export interface MirroredIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /**
   * Whether this icon represents a directional concept that should mirror in RTL.
   * Defaults to true.
   */
  mirror?: boolean;
  /**
   * If true, forces mirroring regardless of current document direction.
   */
  forceMirror?: boolean;
}

/**
 * Wraps icons to handle directional mirroring according to RTL UX guidelines.
 *
 * Directional icons that MUST mirror:
 * - Arrows & Chevrons (forward, back, breadcrumbs, navigation)
 * - Undo / Redo
 * - Sidebar collapse / expand triggers
 * - Pagination next / previous
 *
 * Icons that MUST NOT mirror:
 * - Clocks / Time
 * - Media players (play, pause, fast forward - tape flows left-to-right)
 * - Search magnifying glasses
 * - Checkmarks, close (X), and status badges
 * - Brand logos
 */
export function MirroredIcon({
  children,
  mirror = true,
  forceMirror = false,
  className,
  style,
  ...props
}: MirroredIconProps) {
  const { isRtl } = useDirection();
  const shouldMirror = forceMirror || (mirror && isRtl);

  return (
    <span
      data-mirror-rtl={mirror ? 'true' : undefined}
      data-is-mirrored={shouldMirror ? 'true' : 'false'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: shouldMirror ? 'scaleX(-1)' : undefined,
        transition: 'transform var(--transition-fast, 150ms ease)',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

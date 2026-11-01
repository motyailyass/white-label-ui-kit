import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';
import styles from './textarea.module.css';

export interface TextareaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'children'>,
    ControlSizingProps {}

/**
 * Textarea — Pure Core UI primitive for multi-line text entry.
 *
 * Adheres strictly to the White Label UI Kit architecture:
 * - 100% pure primitive: zero context, zero embedded copy, native ref forwarding.
 * - Logical CSS properties and product-owned density presets.
 * - Stable resting border across hover; high-visibility focus outlines.
 * - Initial height governed by native rows (defaulting to 4); vertical manual resizing.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      size,
      touchTarget = 'auto',
      rows = 4,
      className,
      ...props
    },
    ref,
  ) {
    const classNames = [styles.textarea, className].filter(Boolean).join(' ');

    return (
      <textarea
        ref={ref}
        rows={rows}
        data-size={size}
        data-touch-target={touchTarget}
        className={classNames}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

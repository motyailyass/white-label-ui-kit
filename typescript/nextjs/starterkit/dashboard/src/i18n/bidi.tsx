import type React from 'react';

export interface BidiTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'bdi' | 'span' | 'code';
  dir?: 'ltr' | 'rtl' | 'auto';
}

/**
 * BidiText provides bi-directional text isolation to prevent punctuation bleed
 * and text corruption when mixing Arabic/Hebrew and Latin/English/numeric strings.
 *
 * Example:
 *   <p>
 *     رقم الهاتف: <BidiText dir="ltr">+966 50 123 4567</BidiText>
 *   </p>
 */
export function BidiText({
  children,
  as: Component = 'bdi',
  dir = 'auto',
  className,
  style,
  ...props
}: BidiTextProps) {
  return (
    <Component
      dir={dir}
      data-bidi="isolate"
      className={className}
      style={{
        unicodeBidi: 'isolate',
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Inserts a Left-to-Right Mark (LRM) unicode character (\u200E) to prevent
 * following punctuation or symbols from flipping in RTL context.
 */
export const LRM = '\u200E';

/**
 * Inserts a Right-to-Left Mark (RLM) unicode character (\u200F) to enforce
 * RTL punctuation placement.
 */
export const RLM = '\u200F';

/**
 * Wraps text in LRM marks to isolate inline text cleanly in strings.
 */
export function isolateLtrString(text: string): string {
  return `${LRM}${text}${LRM}`;
}

/**
 * Wraps text in RLM marks to isolate inline text cleanly in strings.
 */
export function isolateRtlString(text: string): string {
  return `${RLM}${text}${RLM}`;
}

'use client';

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './timeline.module.css';

export type TimelineStatus = 'default' | 'complete' | 'active' | 'danger';

interface TimelineItemContextValue {
  status: TimelineStatus;
}

const TimelineItemContext = createContext<TimelineItemContextValue>({ status: 'default' });

function useTimelineItemContext() {
  return useContext(TimelineItemContext);
}

export interface TimelineProps extends ComponentPropsWithoutRef<'ol'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <ol ref={ref} role="list" className={cn(styles.root, className)} data-testid={testId} {...rest}>
      {children}
    </ol>
  );
});

Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends ComponentPropsWithoutRef<'li'> {
  status?: TimelineStatus;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { status = 'default', children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <TimelineItemContext.Provider value={{ status }}>
      <li
        ref={ref}
        data-status={status}
        className={cn(styles.item, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </li>
    </TimelineItemContext.Provider>
  );
});

TimelineItem.displayName = 'TimelineItem';

export interface TimelineConnectorProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  className?: string;
}

export const TimelineConnector = forwardRef<HTMLDivElement, TimelineConnectorProps>(
  function TimelineConnector({ children, className, ...rest }, ref) {
    const { status } = useTimelineItemContext();

    return (
      <div ref={ref} className={cn(styles.connectorWrapper, className)} {...rest}>
        {children}
        <div
          aria-hidden="true"
          className={cn(styles.connector, status === 'complete' && styles.connector_complete)}
        />
      </div>
    );
  },
);

TimelineConnector.displayName = 'TimelineConnector';

export interface TimelinePointProps extends ComponentPropsWithoutRef<'span'> {
  status?: TimelineStatus;
  children?: ReactNode;
  className?: string;
}

export const TimelinePoint = forwardRef<HTMLSpanElement, TimelinePointProps>(function TimelinePoint(
  { status: explicitStatus, children, className, ...rest },
  ref,
) {
  const context = useTimelineItemContext();
  const status = explicitStatus ?? context.status;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(styles.point, styles[`point_${status}`], className)}
      {...rest}
    >
      {children}
    </span>
  );
});

TimelinePoint.displayName = 'TimelinePoint';

export interface TimelineContentProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const TimelineContent = forwardRef<HTMLDivElement, TimelineContentProps>(
  function TimelineContent({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.content, className)} {...rest}>
        {children}
      </div>
    );
  },
);

TimelineContent.displayName = 'TimelineContent';

export interface TimelineHeaderProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const TimelineHeader = forwardRef<HTMLDivElement, TimelineHeaderProps>(
  function TimelineHeader({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.header, className)} {...rest}>
        {children}
      </div>
    );
  },
);

TimelineHeader.displayName = 'TimelineHeader';

export interface TimelineTitleProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  className?: string;
}

export const TimelineTitle = forwardRef<HTMLSpanElement, TimelineTitleProps>(function TimelineTitle(
  { children, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(styles.title, className)} {...rest}>
      {children}
    </span>
  );
});

TimelineTitle.displayName = 'TimelineTitle';

export interface TimelineTimeProps extends ComponentPropsWithoutRef<'time'> {
  children: ReactNode;
  className?: string;
}

export const TimelineTime = forwardRef<HTMLTimeElement, TimelineTimeProps>(function TimelineTime(
  { children, className, ...rest },
  ref,
) {
  return (
    <time ref={ref} className={cn(styles.time, className)} {...rest}>
      {children}
    </time>
  );
});

TimelineTime.displayName = 'TimelineTime';

export interface TimelineBodyProps extends ComponentPropsWithoutRef<'p'> {
  children: ReactNode;
  className?: string;
}

export const TimelineBody = forwardRef<HTMLParagraphElement, TimelineBodyProps>(
  function TimelineBody({ children, className, ...rest }, ref) {
    return (
      <p ref={ref} className={cn(styles.body, className)} {...rest}>
        {children}
      </p>
    );
  },
);

TimelineBody.displayName = 'TimelineBody';

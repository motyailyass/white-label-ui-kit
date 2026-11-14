import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Timeline,
  TimelineBody,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from './timeline';

describe('Timeline Primitive', () => {
  it('renders ordered list with activity timeline semantics', () => {
    render(
      <Timeline aria-label="Activity timeline">
        <TimelineItem status="complete">
          <TimelineConnector>
            <TimelinePoint>✓</TimelinePoint>
          </TimelineConnector>
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>Deployed v1.0.0</TimelineTitle>
              <TimelineTime dateTime="2026-11-10T10:00:00Z">10:00 AM</TimelineTime>
            </TimelineHeader>
            <TimelineBody>Production build succeeded.</TimelineBody>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineConnector>
            <TimelinePoint>•</TimelinePoint>
          </TimelineConnector>
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>Health Check</TimelineTitle>
              <TimelineTime dateTime="2026-11-10T10:05:00Z">10:05 AM</TimelineTime>
            </TimelineHeader>
            <TimelineBody>Verifying edge response times.</TimelineBody>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    const list = screen.getByRole('list', { name: /activity timeline/i });
    expect(list).toBeTruthy();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('data-status')).toBe('complete');
    expect(items[1].getAttribute('data-status')).toBe('active');

    expect(screen.getByText('Deployed v1.0.0')).toBeTruthy();
    expect(screen.getByText('10:00 AM')).toBeTruthy();
    expect(screen.getByText('Production build succeeded.')).toBeTruthy();
  });

  it('renders all status variants including danger and default', () => {
    render(
      <Timeline>
        <TimelineItem status="default">
          <TimelineConnector>
            <TimelinePoint>1</TimelinePoint>
          </TimelineConnector>
          <TimelineContent>
            <TimelineTitle>Default Task</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="danger">
          <TimelineConnector>
            <TimelinePoint>!</TimelinePoint>
          </TimelineConnector>
          <TimelineContent>
            <TimelineTitle>Failed Deployment</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    const items = screen.getAllByRole('listitem');
    expect(items[0].getAttribute('data-status')).toBe('default');
    expect(items[1].getAttribute('data-status')).toBe('danger');
    expect(screen.getByText('!')).toBeTruthy();
  });

  it('allows overriding status explicitly on TimelinePoint', () => {
    render(
      <Timeline>
        <TimelineItem status="default">
          <TimelineConnector>
            <TimelinePoint status="danger" data-testid="override-point">
              Override
            </TimelinePoint>
          </TimelineConnector>
          <TimelineContent>
            <TimelineTitle>Overridden item</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    const point = screen.getByTestId('override-point');
    expect(point.className).toContain('point_danger');
  });

  it('renders semantic time element with valid dateTime attribute', () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineContent>
            <TimelineTime dateTime="2026-11-12T22:00:00Z" data-testid="time-el">
              2 hours ago
            </TimelineTime>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    const timeEl = screen.getByTestId('time-el');
    expect(timeEl.tagName).toBe('TIME');
    expect(timeEl.getAttribute('dateTime')).toBe('2026-11-12T22:00:00Z');
  });
});

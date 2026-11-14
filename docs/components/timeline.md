# Timeline Primitive Specification

## 1. Overview
The `Timeline` primitive renders chronological activity feeds, audit logs, deployment pipelines, and event histories with accessible semantic lists, status indicators, and connector tracks.

## 2. Anatomy
```tsx
<Timeline aria-label="Activity timeline">
  <TimelineItem status="complete">
    <TimelineConnector>
      <TimelinePoint>
        <Icon name="check" size={14} />
      </TimelinePoint>
    </TimelineConnector>
    <TimelineContent>
      <TimelineHeader>
        <TimelineTitle>Deployment Finished</TimelineTitle>
        <TimelineTime dateTime="2026-11-10T12:00:00Z">2m ago</TimelineTime>
      </TimelineHeader>
      <TimelineBody>Cluster edge nodes updated to version 2.4.1.</TimelineBody>
    </TimelineContent>
  </TimelineItem>
</Timeline>
```

## 3. Keyboard & Accessibility Contracts
- Container renders an ordered semantic list: `<ol role="list" aria-label="Activity timeline">`.
- Each entry is an `<li>` element with `data-status="default" | "complete" | "active" | "danger"`.
- Connector track is decorative (`aria-hidden="true"`).
- Dates use semantic `<time dateTime="...">`.
- Status indicators convey meaning through color and accessible icons or text labels.

## 4. Visual & Token Specifications
- **Colors**:
  - Point Default: background `--color-surface-hover`, border `--color-border-subtle`, text `--color-text-secondary`
  - Complete: background `--color-primary`, border `--color-primary`, text `--color-primary-foreground`
  - Active: background `--color-surface`, border `--color-primary`, text `--color-primary`
  - Danger: background `--color-danger-solid`, border `--color-danger-solid`, text `--color-danger-solid-foreground`
- **Track & Connector**:
  - Point size governed by `--_timeline-point-size` (default `1.75rem` / 28px).
  - Connector line centered precisely under the point indicator (`inset-inline: 0; margin-inline: auto`).
  - Active/complete items highlight the connector line using `--color-primary`.
  - The last timeline item automatically suppresses its trailing connector.
- **Direction & Logical Properties**:
  - 100% CSS logical properties (`margin-inline`, `padding-block`, `inset-inline-start`).
  - Perfect RTL mirroring without directional hardcoding. Dashboard is 100% shadow-free.

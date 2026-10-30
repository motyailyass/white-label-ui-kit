---
trigger: glob
globs: "**/src/components/shell/**, **/src/layouts/**"
description: AppShell architecture, layout slots, mobile drawer accessibility, and landmark hygiene.
---

# 35-layouts-shell: Layout Shells & Landmark Hygiene

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Unified AppShell Structure
- **One AppShell hierarchy**: All application layouts (`ClassicLayout`, `DualSidebarLayout`, `ThreeColumnLayout`) must wrap content inside a common `<AppShell>` and `<AppShellMain>` primitive.
- **Composition via slots**: Provide clean slots for navigation, breadcrumbs, header actions, and footer controls. Never hardcode child views into layout wrappers.
- **Data vs config props**: Separate layout variant configuration (`layoutVariant="classic"`, `contentLayout="boxed"`) from data props (`navigation`, `breadcrumbs`, `user`).

## 2. Landmark Hygiene & Semantics
- **No nested `<aside>` landmarks**: The root sidebar renders `<aside aria-label="Sidebar navigation">`. Sub-rails or secondary panes (`SidebarPrimary`, `SidebarSecondary`) must render `<div>` elements to prevent duplicate landmarks.
- **Aria-current on active nav**: The active route item must receive `aria-current="page"` and `data-active="true"`.

## 3. Mobile Drawer Contract
- **Trigger binding**: `SidebarTrigger` must supply `aria-controls="app-sidebar"` and `aria-expanded={isOpen}`.
- **Escape dismissal**: The mobile overlay drawer must dismiss on `Escape` key press.
- **Focus trapping**: When the mobile drawer opens, trap keyboard focus within the drawer (`Tab` / `Shift+Tab`) and return focus to the trigger upon closing.
- **Scroll locking**: Lock `document.body.style.overflow = 'hidden'` while the mobile drawer is open.


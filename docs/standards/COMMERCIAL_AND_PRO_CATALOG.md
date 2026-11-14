# Commercial & Pro Component Catalog Roadmap

**Repository:** `motyailyass/white-label-ui-kit`  
**Status:** Architectural Specification & Roadmap  
**Standards Compliance:** React 19, CSS Modules, CSS Logical Properties, Zero-Shadow Dashboard, Localized RTL-First

---

## 1. Executive Vision & Architecture Principles

The White-Label UI Kit provides a production-grade, white-label React foundation for high-performance dashboards and marketing websites across Next.js and Vite.

Following the established open-core engineering models of **MUI / MUI X** and **Meta Open Source** (Lexical, React Flow, StyleX patterns), the system draws a strict architectural boundary between **pure foundational primitives** and **advanced domain/commercial capabilities**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 3: ENTERPRISE & AGENCY                     │
│  Multi-Brand Token Engine · Source Redistribution · 10+ Full Templates │
├────────────────────────────────────────────────────────────────────────┤
│                           TIER 2: PRO CATALOG                          │
│  Virtualized DataGrid · Scheduler · Lexical Editor · Kanban · Canvas   │
│  Advanced Charts · Multi-Step Wizards · RBAC & Billing Blocks          │
├────────────────────────────────────────────────────────────────────────┤
│                  TIER 1: COMMUNITY CORE (100% FREE)                    │
│  56 Zero-Dependency Primitives · Fully Accessible · RTL First · Tokens │
└────────────────────────────────────────────────────────────────────────┘
```

### The Inviolable Golden Rule: *Un-crippled Core, High-Leverage Pro*
1. **Never cripple free primitives**: We strictly prohibit artificial forks (such as `FreeInput` vs `ProInput` or crippling `Select` with arbitrary item limits). Every core primitive is 100% functional, accessible, token-driven, and zero-dependency.
2. **Pro delivers computational & domain depth**: Pro value is defined by:
   - **Computational complexity**: Virtualization, column pinning, multi-sort, row aggregation, and client-side binary exports (`.xlsx`).
   - **Domain engines**: Full WYSIWYG document editing (Meta Lexical), multi-resource scheduling, DAG node-flow canvases, and drag-and-drop boards.
   - **Pre-assembled application blocks**: Complete authentication suites, RBAC permission tables, billing matrices, and multi-tenant layout frameworks.

---

## 2. Three-Tier Architectural Taxonomy

```
App Routes & Templates (Next.js app/, Vite src/pages/, wireframes/)
       ↓ consumes via localized props & host-agnostic slots (as, imageComponent)
Tier 2 & 3: Pro Patterns, Blocks & Layouts (components/patterns/*, components/shell/*, layouts/*)
       ↓ binds providers, virtualization, or domain engines to pure primitives
Tier 1: Core UI Primitives & Icons (components/ui/*, components/icons/*)
       ↓ consumes via CSS variables and tokens
Tokens, Presets & Foundation (styles/tokens/*, styles/{dashboard,website}/*, i18n/*, providers/*)
```

---

## 3. Tier 1: Community Core UI Primitives (55 Free Primitives)

All 56 primitives below are author-owned, zero-dependency (no Radix, no Tailwind), fully accessible (WAI-ARIA compliant), 100% CSS Logical Properties, and RTL-first:

| # | Primitive | Directory | Key Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | `Accordion` | `components/ui/accordion/` | Single/multiple collapse, keyboard navigation, animated height |
| 2 | `Alert` | `components/ui/alert/` | Semantic status levels (info, success, warning, error), dismiss action |
| 3 | `AlertDialog` | `components/ui/alert-dialog/` | Destructive action confirmation modal, focus trap, escape key |
| 4 | `AspectRatio` | `components/ui/aspect-ratio/` | Responsive media container (16:9, 4:3, 1:1, custom ratio) |
| 5 | `Avatar` | `components/ui/avatar/` | Image fallback, initials generation, status badge anchor |
| 6 | `Badge` | `components/ui/badge/` | Status indicator, count badge, dot variants, semantic colors |
| 7 | `Breadcrumb` | `components/ui/breadcrumb/` | Structured navigation trail, collapse overflow, current page indicator |
| 8 | `Button` | `components/ui/button/` | 6-step sizing scale (`xs`–`2xl`), variants, loading spinner, touch targets |
| 9 | `Card` | `components/ui/card/` | Semantic surface container, header, content, footer sections |
| 10 | `Chart` | `components/ui/chart/` | Native SVG Bar, Line, Donut charts; WAI-ARIA hidden data table |
| 11 | `Checkbox` | `components/ui/checkbox/` | Indeterminate state, custom SVG checkmark, keyboard focus ring |
| 12 | `Collapsible` | `components/ui/collapsible/` | Barebones disclosure primitive for panels and menus |
| 13 | `Combobox` | `components/ui/combobox/` | Filterable autocomplete, keyboard list navigation, portal overlay |
| 14 | `CommandPalette` | `components/ui/command-palette/` | Global search modal (`Cmd+K`), group filtering, shortcut badges |
| 15 | `ContextMenu` | `components/ui/context-menu/` | Right-click overlay with submenus, separators, and shortcut keys |
| 16 | `DataTable` | `components/ui/data-table/` | Foundational semantic table, column headers, striped rows |
| 17 | `DatePicker` | `components/ui/date-picker/` | Popover calendar picker, single-date selection, native Intl formatting |
| 18 | `Dialog` | `components/ui/dialog/` | Native `<dialog>` backdrop, focus trapping, escape dismiss |
| 19 | `Dropdown` | `components/ui/dropdown/` | Generic anchor popover positioning, outside-click listener |
| 20 | `EmptyState` | `components/ui/empty-state/` | Illustration slot, heading, supporting text, and action buttons |
| 21 | `FileUpload` | `components/ui/file-upload/` | Drag-and-drop target, file size validation, progress state |
| 22 | `FilterBar` | `components/ui/filter-bar/` | Search input, filter trigger chips, reset all actions |
| 23 | `HoverCard` | `components/ui/hover-card/` | Pointer hover preview card with enter/leave delays |
| 24 | `Input` | `components/ui/input/` | Single-line text input, 6-step scale, start/end adornment slots |
| 25 | `InputOTP` | `components/ui/input-otp/` | Split one-time password inputs, automatic focus advance, paste support |
| 26 | `Kbd` | `components/ui/kbd/` | Keyboard shortcut badge (`⌘K`, `Enter`, `Esc`), modifier icons |
| 27 | `Label` | `components/ui/label/` | Accessible form label with programmatic `htmlFor` association |
| 28 | `NavigationMenu` | `components/ui/navigation-menu/` | Desktop horizontal mega-menu, indicator line, nested sub-panels |
| 29 | `Pagination` | `components/ui/pagination/` | Accessible page buttons, ellipsis jump, previous/next controls |
| 30 | `Popover` | `components/ui/popover/` | Generic floating popover with collision boundary detection |
| 31 | `Progress` | `components/ui/progress/` | Determinate/indeterminate progress bar, WAI-ARIA meter |
| 32 | `Radio` | `components/ui/radio/` | Pure radio input with token sizing, RTL-safe custom indicator |
| 33 | `RadioGroup` | `components/ui/radio-group/` | Accessible roving tabindex radio options, vertical/horizontal layout |
| 34 | `ResizablePanel` | `components/ui/resizable-panel/` | Split panes with draggable divider, keyboard resize |
| 35 | `ScrollArea` | `components/ui/scroll-area/` | Custom cross-browser scrollbar track and thumb |
| 36 | `SearchInput` | `components/ui/search-input/` | Search field with icon, shortcut focus key, and suffix/clear slots |
| 37 | `Select` | `components/ui/select/` | Accessible custom dropdown select, option groups, keyboard search |
| 38 | `Separator` | `components/ui/separator/` | Horizontal and vertical semantic divider (`role="separator"`) |
| 39 | `Sheet` | `components/ui/sheet/` | Slide-over drawer (start, end, top, bottom), overlay backdrop |
| 40 | `Skeleton` | `components/ui/skeleton/` | Animated shimmer placeholder for loading states |
| 41 | `Slider` | `components/ui/slider/` | Single and dual-thumb range slider, tick marks, keyboard step |
| 42 | `Spinner` | `components/ui/spinner/` | Accessible CSS loading spinner, polite live-region announcement |
| 43 | `StatCard` | `components/ui/stat-card/` | Key metric card, trend indicator (+/- percent), sparkline slot |
| 44 | `StatusDot` | `components/ui/status-dot/` | Live status dot (online, offline, busy, away), optional pulse |
| 45 | `Stepper` | `components/ui/stepper/` | Multi-step progress indicator, complete/active/pending states |
| 46 | `Switch` | `components/ui/switch/` | Accessible toggle switch, checked/unchecked thumb animation |
| 47 | `Tabs` | `components/ui/tabs/` | Roving tabindex tabs list, tab panels, horizontal/vertical |
| 48 | `Textarea` | `components/ui/textarea/` | Multi-line auto-resizing text field, density independent of rows |
| 49 | `ThemeToggle` | `components/ui/theme-toggle/` | Pure theme switch button; localized labels and state arrive via props |
| 50 | `Timeline` | `components/ui/timeline/` | Vertical chronological event trail, status nodes, date stamps |
| 51 | `Toast` | `components/ui/toast/` | Notification banner queue, automatic dismissal, swipe to close |
| 52 | `Toggle` | `components/ui/toggle/` | Two-state toggle button (`aria-pressed`) |
| 53 | `ToggleGroup` | `components/ui/toggle-group/` | Single or multi-select button toolbar (e.g. text alignment) |
| 54 | `Tooltip` | `components/ui/tooltip/` | Hover/focus descriptive tooltip, collision boundary avoidance |
| 55 | `TreeView` | `components/ui/tree-view/` | Hierarchical directory tree, folder expand/collapse, leaf selection |
## 4. Tier 2: Pro Component Engines (MUI X & Meta Inspired)

Pro components provide the deep computational, analytical, and editing capabilities demanded by complex software products:

### 4.1 Enterprise DataGrid Pro (`components/patterns/data-grid-pro/`)
*MUI X DataGrid Pro/Premium Reference Architecture*
- **Virtualization Engine**: Headless row and column virtualization using CSS `transform` rendering 500,000+ rows smoothly at 60fps.
- **Sticky Column Pinning**: Pin columns to `start` or `end` via CSS sticky positioning; fully handles RTL mirror layouts.
- **Dynamic Column Reordering & Resizing**: Drag-and-drop column headers with live ghost indicators, keyboard-accessible resize handles, and persisted column widths.
- **Faceted Compound Filter Builder**: Multi-clause query builder (`AND` / `OR`, `contains`, `greater than`, `between`, `isAnyOf`) with autocomplete chips.
- **Row Grouping & Tree Grids**: Hierarchical roll-up rows with aggregate functions (`sum`, `average`, `min`, `max`, `count`) in sticky group footers.
- **Clipboard & Spreadsheet Operations**: Multi-cell marquee drag selection, copy TSV/CSV to clipboard, Excel-compatible paste parsing.
- **Native Export**: Client-side background `.xlsx` and formatted `.csv` generation without backend round-trips.

### 4.2 Rich Document & Content Editor Pro (`components/patterns/rich-editor-pro/`)
*Meta Lexical Reference Architecture*
- **WYSIWYG Markdown Core**: Built on Meta’s headless Lexical engine, fully wrapped in our white-label CSS token system.
- **Slash Menu (`/`)**: Inline dropdown triggered by typing `/` to insert: Heading 1–3, Bullet/Numbered List, Checklist, Code Block, Table, Divider, or Callout.
- **Floating Bubble Toolbar**: Contextual selection popover for Bold, Italic, Link, Inline Code, Strikethrough, Color highlight, and Alignment.
- **Interactive Data Tables**: In-editor table grids with insert/delete row/column, cell merging, and column width drag handles.
- **Code Block Studio**: Multi-language code syntax highlighting with language selector and one-click copy button.
- **Serialization**: Native export to clean Markdown, HTML, or structured JSON AST.

### 4.3 Advanced Scheduler & Calendar Grid (`components/patterns/scheduler-pro/`)
*MUI X Date Pickers Pro & Google Calendar Architecture*
- **Multi-View Engine**: Day View, Week View, Work-Week View (5-day), Month Grid, and linear Agenda Feed.
- **Resource Swimlanes**: Multi-resource allocation lanes (e.g. room bookings, doctor appointments, vehicle fleet dispatch).
- **Drag-and-Drop Scheduling**: Fluid drag-to-reschedule and drag-edge to resize event durations with snap-to-grid (15m, 30m, 1h).
- **Timezone Conversion**: Seamless live conversion between Local, UTC, and target international timezones.
- **Recurrence Engine**: Full RFC-5545 RRULE support for daily, weekly, monthly, and custom recurrence intervals.

### 4.4 Advanced Analytics & Financial Charts (`components/patterns/analytics-pro/`)
*MUI X Charts Pro & TradingView Architecture*
- **Multi-Axis Composite Charts**: Synchronized Dual-Y-Axis combining Bar volume and Line trend indicators.
- **Brush Timeline & Zoom Slider**: Interactive miniature timeline overview with movable brush window for zooming into high-density time series.
- **Financial Candlestick & OHLC Charts**: Open-High-Low-Close candlestick charts with volume bars and tooltip crosshairs.
- **Heatmaps & Cohort Retention Grids**: Matrix visualization for user retention cohorts, server activity, or weekly traffic density.
- **Funnel & Sankey Visualizations**: Visual multi-stage conversion funnels with drop-off percentages.

### 4.5 Workflow Pipeline & Node Canvas (`components/patterns/flow-canvas-pro/`)
*Meta / React Flow Architecture*
- **Infinite Hardware-Accelerated Canvas**: Pan, zoom, and fit-to-view navigation with interactive mini-map.
- **Customizable Nodes & Connection Sockets**: Visual ports supporting typed input/output connections, animated bezier curves, and step indicators.
- **Graph State Engine**: DAG cycle detection, auto-layout algorithms (Dagre/ELK), and clean JSON import/export.

### 4.6 Kanban Workspace Engine (`components/patterns/kanban-pro/`)
*Trello / Linear Reference Architecture*
- **Fluid Drag-and-Drop**: Accessible drag-and-drop between lanes with keyboard fallback (Space to lift, Arrow keys to move, Enter to drop).
- **Swimlanes**: Horizontal grouping by Assignee, Priority, or Milestone.
- **Quick-Card Creation**: Inline task creator with tag chips, estimate dropdown, and due date picker.

### 4.7 JSON & State Inspector (`components/patterns/inspector-pro/`)
*Meta DevTools Reference Architecture*
- **Collapsible AST Tree**: Formatted rendering of complex JSON payloads with type badges (string, number, boolean, object, array).
- **Deep Search & Filter**: Real-time key/value regex search with match highlighting and auto-expansion of matching paths.
- **One-Click Path Copy**: Copy JSONPath (`payload.users[0].id`) or raw value directly to clipboard.

### 4.8 Visual Code & Text Diff Viewer (`components/patterns/diff-viewer-pro/`)
*GitHub / VS Code Reference Architecture*
- **Split & Unified View**: Toggle between side-by-side split comparison and inline unified diff.
- **Word-Level Granularity**: Accurate character and word-level addition/deletion highlights.
- **Collapsible Unchanged Regions**: Automatically fold large unchanged line blocks with expand-chunk handles.

---

## 5. The 10+ Production Dashboard Layouts

The UI Kit includes 10 distinct, fully tested layout architectures tailored to specific enterprise product workflows:

| # | Layout Name | Core Structure | Target Product Type |
| :--- | :--- | :--- | :--- |
| 1 | **Classic Dashboard** | Collapsible sidebar + sticky header + responsive main container | Standard SaaS apps, admin consoles |
| 2 | **Dual-Sidebar Layout** | Primary icon rail + secondary collapsible tree/channel sidebar | Slack-like messaging, Notion-like workspaces |
| 3 | **Three-Column Inspector** | Navigation sidebar + master data list + detail property inspector | CRM pipelines, email clients, inventory managers |
| 4 | **Collapsed Rail / Dock** | Ultra-compact 48px icon dock expanding on hover/focus | Analytics dashboards, graphic editing tools |
| 5 | **Topbar Command Hub** | Horizontal full-width header with mega-menus + global search | Financial terminals, trading desks, portals |
| 6 | **Split-Screen Studio** | Draggable 50/50 or custom resizable editor/preview split | Low-code builders, markdown studios, preview engines |
| 7 | **Master-Detail Inbox** | Master thread list with unread markers + full-width reading pane | Ticketing systems, customer support inboxes |
| 8 | **Kanban Workspace** | Horizontally scrolling board with sticky lane headers | Project management, agile sprint boards |
| 9 | **Executive BI Portal** | KPI scorecard row + multi-card chart grid + live table footer | C-suite dashboards, marketing analytics |
| 10 | **Multi-Tenant Org Hierarchy** | Organization switcher + breadcrumb trail + settings drawer | Multi-tenant B2B SaaS, cloud infrastructure consoles |

---

## 6. Production Application Blocks

High-conversion, drop-in application blocks wired with full validation, accessibility, and internationalization:

### 6.1 Authentication & Identity Suite (`blocks/auth/`)
- **Login & Registration**: Email/password, magic link, and social OAuth providers (Google, GitHub, Microsoft).
- **MFA Challenge**: Two-factor authenticator prompt utilizing `InputOTP` with fallback backup code entry.
- **Password Reset & Recovery**: Email verification request and password change form with live strength estimation.

### 6.2 Subscription & Billing Matrix (`blocks/billing/`)
- **Pricing Matrix**: Monthly/Annual pricing toggle with savings badges and tiered feature checklists.
- **Payment Method Management**: Saved credit card manager with card brand icons, billing address form, and default selector.
- **Invoices & Receipts**: Paginated invoice history with status badges and one-click PDF download triggers.

### 6.3 RBAC Team & Permissions Engine (`blocks/team-rbac/`)
- **Member Invite Flow**: Multi-email invite modal with role assignment (Admin, Editor, Viewer, Billing, Custom).
- **Permission Matrix Table**: Feature-by-feature CRUD permission checkbox grid with "Select All" column toggles.
- **Audit Trails**: Security log displaying user actions, timestamp, IP address, and changed properties.

---

## 7. Website Marketing Starters & Templates

Ready-to-deploy, high-converting website themes:

1. **Tokyo (Developer / AI Platform)**:
   - High-contrast dark visual hierarchy.
   - Terminal command copy blocks, interactive feature tabs, and benchmark comparison grids.
2. **Kyoto (Modern SaaS / FinTech)**:
   - Warm, balanced editorial typography with calm, generous white space.
   - Interactive ROI calculator, customer testimonial carousels, and multi-tier pricing cards.
3. **Zurich (Enterprise / Infrastructure)**:
   - Swiss International design aesthetic: rigid mathematical grids, hairline border styling, and data-dense typography.
   - Security compliance badges (SOC2, HIPAA, GDPR), enterprise RFP inquiry form, and status page integration.

---

## 8. Licensing, Delivery & Packaging Strategy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ WHITE LABEL UI KIT OFFERING TIERS                                                │
├─────────────────────┬──────────────────────────────┬─────────────────────────────┤
│ Tier 1: Community   │ Tier 2: Pro                  │ Tier 3: Enterprise & Agency │
├─────────────────────┼──────────────────────────────┼─────────────────────────────┤
│ • 56 Core Primitives│ • Virtualized DataGrid Pro   │ • Everything in Pro         │
│ • Full Accessibility│ • Scheduler & DateRange Pro  │ • Source Redistribution     │
│ • RTL & Tokens      │ • Lexical Rich Text Editor   │ • Multi-Brand Theme Engine  │
│ • Next.js & Vite    │ • Kanban & Flow Canvas       │ • Unlimited Client Projects │
│ • Classic Layout    │ • 10+ Complete Layouts       │ • Private Figma Token Sync  │
│ • MIT Open Source   │ • All Application Blocks     │ • Dedicated SLA & Support   │
└─────────────────────┴──────────────────────────────┴─────────────────────────────┘
```

### Commercial Delivery Standards
- **Private Registry / Package Distribution**: Pro and Enterprise features install as self-contained packages (e.g. `@starterkit/pro-grid`, `@starterkit/rich-editor`) without requiring sibling monorepo dependencies.
- **Zero Lock-In**: Starters remain 100% extractable into standalone repositories with zero corporate tracking scripts or mandatory badges.

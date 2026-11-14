# Skeleton — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/skeleton`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/skeleton/`  
> **Gallery route:** `/gallery/skeleton`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Skeleton** is a low-fidelity placeholder preview rendered in place of real content while asynchronous data is fetching. Skeletons preserve layout geometry, eliminate cumulative layout shift (CLS), and dramatically improve perceived application performance.

### 1.1 In Scope
- **Visual Geometry Variants**:
  - `text` (default, standard single-line typographic height with scale transform simulating text baseline)
  - `circular` (50% border radius, ideal for user avatars and circular icons)
  - `rectangular` (square corners, ideal for full-bleed images and video previews)
  - `rounded` (consumes `--radius-card` / 8px, ideal for buttons, cards, and input fields)
- **Animation Modes**:
  - `pulse` (default subtle opacity pulsation between 1.0 and 0.4)
  - `wave` (horizontal shimmer sweep gradient)
  - `none` (static block for low-power or zero-motion environments)
- **Polymorphism**: Support for `as?: ElementType` (rendering as `span` for inline text, or `div` for surface blocks).
- **Reduced Motion Architecture**:
  - Automatically disables pulse and wave animations under `@media (prefers-reduced-motion: reduce)`, displaying a stable 60% opacity surface without flickering.
- **Pure White-Label Boundaries**: Consumes `--color-border-subtle` (guaranteed contrast against both `--color-bg-base` and `--color-surface` across light and dark modes); 100% shadow-free, with directional RTL wave sweep (`waveRtl`) support.

### 1.2 Out of Scope
- Data fetching lifecycle management (handled by React Query or server components).
- Complex domain-specific compound skeletons (composed in application wireframes using basic `Skeleton` building blocks).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Skeleton` primitive resides in `src/components/ui/skeleton/`:
- **Decorative by Default**: Carries `aria-hidden="true"` because skeleton boxes are visual approximations and must not create confusing empty landmarks in screen readers.
- **Dimension Overrides via Scoped Custom Properties**: Consumes `--_sk-width` and `--_sk-height` rather than direct layout styles.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ composes compound loading screens
Connected Patterns & Studio (components/patterns/skeleton-gallery/)
       ↓ binds animation & variant toggles
Core UI Primitives (components/ui/skeleton/)
       ↓ pure primitive (skeleton.tsx, skeleton.module.css)
Design Tokens (tokens/color-roles.css, tokens/radius.css, tokens/motion.css)
```

---

## 3. Visual Variants & Semantic Token Contracts

| Variant | Border Radius Token | Default Dimensions | Default Tag |
| :--- | :--- | :--- | :--- |
| **`text`** | `--radius-xs` (2px) | Inline 100%, block 1em | `<span>` |
| **`circular`** | `50%` | 2.5rem × 2.5rem | `<div>` |
| **`rectangular`** | `0` | Inline 100%, block auto | `<div>` |
| **`rounded`** | `--radius-card` (8px) | Inline 100%, block auto | `<div>` |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **Screen Reader Isolation**:
   - `aria-hidden="true"` is set on every skeleton element.
   - Live loading announcements are managed at the section container level with `aria-busy="true"` and `role="status"`.
2. **Reduced Motion Guarantee**:
   - `@media (prefers-reduced-motion: reduce)` zeroes animations and sets static opacity.

---

## 5. Component API & Props Specification

```typescript
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps extends ComponentPropsWithRef<'div'> {
  /** Visual shape of the placeholder. Defaults to 'text' */
  variant?: SkeletonVariant;

  /** Animation style. Defaults to 'pulse' */
  animation?: SkeletonAnimation;

  /** Width override as CSS value (e.g., '100px', '50%', 40) */
  width?: string | number;

  /** Height override as CSS value (e.g., '20px', '2rem', 20) */
  height?: string | number;

  /** Polymorphic element tag. Defaults to 'span' for text, 'div' for surfaces */
  as?: ElementType;

  /** Additional CSS class names */
  className?: string;
}
```

## 6. Verification & QA Gates
- **Unit & RTL Tests (`skeleton.test.tsx`)**: Verifies decorative `aria-hidden="true"`, clean style omission when dimensions are omitted, all 4 shape variants and default tags (`span` vs `div`), polymorphic `as`, custom `--_sk-width` / `--_sk-height` variable merging, all 3 animation modes, RTL container context, and ref forwarding.
- **Playwright E2E (`e2e/skeleton.spec.ts`)**: Verifies light-mode surface contrast (skeleton background differs from container surface), `text` / `circular` / `rounded` / `rectangular` geometry, `wave` / `none` animations, `Simulate Content Loaded` toggle, `prefers-reduced-motion: reduce` animation disabling, zero Dashboard shadows, RTL `lang="ar"`, Full Matrix, and zero mobile horizontal overflow.

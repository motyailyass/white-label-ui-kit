# Avatar — Component Reference

> **Status:** Implemented Reference  
> **Component:** `components/ui/avatar`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Dashboard  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/avatar/`  
> **Gallery route:** `/gallery/avatar`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

An **Avatar** is a visual representation of a user, team, or entity. It displays an image when available, falls back through a deterministic three-tier hierarchy (image → extracted or explicit initials → anonymous vector icon), and supports optional presence status indicators and overlapping multi-avatar stacks (`AvatarGroup`).

### 1.1 In Scope
- **Three-Tier Fallback Hierarchy**:
  1. **Image Layer**: Remote, static, or inline data URI image source (`src`), rendered via native `<img>` or host `imageComponent` slot.
  2. **Initials Layer**: Up to 2 characters extracted via `extractInitials(name, initials)`.
  3. **Fallback Icon Layer**: Decorative vector glyph (`<Icon name="anonymous" />`, or `fallbackIcon`) wrapped with `aria-hidden="true"`.
- **Image Lifecycle State Machine**:
  - `idle` → `loading` → `loaded` (renders `<img>`) or `error` (unmounts broken `<img>` and falls back to initials or anonymous icon). Cached `imgRef.current.complete` images resolve synchronously in `useEffect`.
- **Universal 6-Step Sizing Scale**:
  - `xs` (`24px` / `1.5rem`), `sm` (`32px` / `2rem`), `md` (`40px` / `2.5rem`, default), `lg` (`48px` / `3rem`), `xl` (`56px` / `3.5rem`), `2xl` (`64px` / `4rem`).
- **Shapes**: `circle` (`--radius-full`, default) and `rounded` (`--radius-control`: `6px` Dashboard / `8px` Website).
- **Presence Status Indicator**: Optional dot (`online`, `offline`, `away`, `busy`) anchored at `inset-block-end` / `inset-inline-end` at `var(--_z-layer-raised)`.
- **AvatarGroup Stack**: Overlapping horizontal group with size-proportional negative logical inline margins (`margin-inline-start`), `2px solid var(--color-surface)` cutout rings, BiDi-isolated `+{N}` counter (`dir="ltr"`), and caller-supplied `overflowAriaLabel`.
- **Zero Shadows & Framework Neutrality**: Zero `next/*` imports inside `components/ui/avatar/` and 100% shadow-free in both starters.

### 1.2 Out of Scope
- Direct image upload or cropping dialogs.
- Hover user profile cards.

---

## 2. Architecture & White-Label Isolation

- **Zero Third-Party UI Libraries:** Native `<div>`, `<span>`, `<img>`, and `<Icon>` wrapper only.
- **No Silent English Fallbacks:**
  - `Avatar`: Renders `role="status"` + `aria-label={statusAriaLabel}` when localized `statusAriaLabel` is provided; otherwise marks the status dot `aria-hidden="true"` rather than leaking an untranslated `'online'` / `'busy'` prop value.
  - `AvatarGroup`: Exposes optional `overflowAriaLabel?: string` without embedding hardcoded `"+N more"` English strings.
- **Readable Initials vs Decorative `alt=""`**: Informative fallback initials stay readable in the accessibility tree; only explicit `alt=""` decorative avatars set `aria-hidden="true"` on `.initials`.

---

## 3. Fallback Hierarchy & Initials Algorithm

### `extractInitials(name?: string, initials?: string): string`
1. If `initials` is non-empty after trim, returns up to `2` uppercased characters.
2. If `name` contains multiple whitespace-separated words, takes the first Unicode code point (`Array.from`) of the first and last words (e.g. `"Sarah Connor"` → `"SC"`, `"طارق علي"` → `"طع"`).
3. If `name` is a single word, takes up to `2` leading code points (e.g. `"Alice"` → `"AL"`, `"فاطمة"` → `"فا"`).
4. Otherwise returns `""` so `Avatar` renders the anonymous fallback icon.

Arabic monograms matched via `:lang(ar)` or `[dir='rtl']` use `var(--font-family-arabic), var(--font-family-sans)`, `line-height: var(--line-height-arabic-snug)`, and `text-transform: none`.

---

## 4. Sizing Scale & Token Contracts

| Size | Box Size | Monogram Font | Monogram Line Height | Icon Size | Status Dot Size | Stack Overlap (`margin-inline-start`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `24px` (`1.5rem`) | `var(--font-size-xs)` (`12px`) | `var(--line-height-none)` | `0.75rem` (`12px`) | `0.5rem` (`8px`) | `-0.5rem` (`-8px`) |
| **`sm`** | `32px` (`2rem`) | `var(--font-size-xs)` (`12px`) | `var(--line-height-tight)` | `1rem` (`16px`) | `0.5625rem` (`9px`) | `-0.625rem` (`-10px`) |
| **`md`** | `40px` (`2.5rem`) | `var(--font-size-sm)` (`14px`) | `var(--line-height-tight)` | `1.25rem` (`20px`) | `0.6875rem` (`11px`) | `-0.75rem` (`-12px`) |
| **`lg`** | `48px` (`3rem`) | `var(--font-size-lg)` (`18px`) | `var(--line-height-tight)` | `1.5rem` (`24px`) | `0.8125rem` (`13px`) | `-0.875rem` (`-14px`) |
| **`xl`** | `56px` (`3.5rem`) | `var(--font-size-xl)` (`20px`) | `var(--line-height-tight)` | `1.75rem` (`28px`) | `0.9375rem` (`15px`) | `-1rem` (`-16px`) |
| **`2xl`** | `64px` (`4rem`) | `var(--font-size-2xl)` (`24px`) | `var(--line-height-tight)` | `2rem` (`32px`) | `1.0625rem` (`17px`) | `-1.125rem` (`-18px`) |

---

## 5. Surface, Status & Stacking Tokens

- **Initials Surface (`.surface`)**: `background-color: var(--color-primary-subtle)`, `color: var(--color-primary-subtle-foreground)`, `border: 1px solid var(--color-border-subtle)`.
- **Anonymous Icon (`.fallbackIcon`)**: `color: var(--color-text-muted)`.
- **Status Indicator Tokens**:
  - `online`: `var(--color-success)`
  - `away`: `var(--color-warning)`
  - `busy`: `var(--color-danger)`
  - `offline`: `var(--color-text-muted)`
  - Positioned with `inset-block-end` / `inset-inline-end` (`2%` for `circle`, `-1px` for `rounded`), `border: 2px solid var(--color-surface)`, and `z-index: var(--_z-layer-raised)`.
- **Group Cutouts**: `.groupedAvatar .surface` and `.overflowCounter .surface` apply `border: 2px solid var(--color-surface)`.

---

## 6. Component API Specification

```typescript
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  statusAriaLabel?: string;
  imageComponent?: React.ElementType;
  fallbackIcon?: React.ReactNode;
  className?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  overflowAriaLabel?: string;
  className?: string;
}
```

---

## 7. Verification

- **Unit suite**: `src/components/ui/avatar/avatar.test.tsx` (18 tests covering `extractInitials` Latin + Arabic scripts, image loading/error fallback, initials readability vs `alt=""` decorative hiding, 6 sizing steps, shapes, status labels without English fallbacks, `imageComponent` slot, ref forwarding, and `AvatarGroup` `max` + `dir="ltr"` counter + `overflowAriaLabel`).
- **Browser verification**: `e2e/avatar.spec.ts` covering `/gallery/avatar` scale (`xs`–`2xl`), shape tokens (`rounded` = `6px` Dashboard / `8px` Website), offline status token visibility, 3-tier fallback hierarchy (`image` → `broken` → `initials` → `anonymous`), `AvatarGroup` overlap & LTR `+2` counter under RTL, Arabic `lang="ar"` rendering, and zero dashboard shadows.

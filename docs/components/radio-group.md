# Radio Group Component Specification

## 1. Overview
The `RadioGroup` primitive provides compound grouping, coordinated mutual exclusivity, and accessible layout structuring for sets of related radio options. Built around the pure white-label `Radio` primitive, it binds native HTML radio inputs with a semantic `<div role="radiogroup">` container, managed value state, and flex/grid layout orientations.

## 2. Architectural Role & Layer Boundaries
- **Purity**: Zero third-party dependencies. Extends the pure `Radio` primitive.
- **WAI-ARIA Pattern**: `role="radiogroup"`, `aria-labelledby`, `aria-describedby`, and `aria-orientation`.
- **Keyboard Navigation**: Native browser arrow-key cycling across identical `name` radio options without brittle synthetic key intercepts.

## 3. Compound Component Hierarchy
- `RadioGroup`: Root container managing group state (`name`, `value`, `defaultValue`, `onValueChange`, `disabled`, `size`, `orientation`).
- `RadioGroupItem`: Option wrapper containing the native `Radio` primitive, bound to the parent group state.

## 4. CSS & Token Contracts
- CSS logical properties: `gap`, `flex-direction`, `padding-inline`.
- Control sizing: `size` prop inherits the 6-step scale (`xs` through `2xl`).
- Orientations: `vertical` (column) and `horizontal` (row wrap).

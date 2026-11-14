# Stepper Primitive Specification

## 1. Overview
The `Stepper` primitive represents linear progression through an ordered sequence of tasks, wizards, or workflow checkpoints. It indicates completed steps, active steps, and future steps with semantic accessibility, optional clickable step navigation, horizontal/vertical orientations, and flexible content display (Full, Title Only, or Indicator Only).

## 2. Anatomy & Variations

### Full Wizard (Indicator + Title + Description)
```tsx
<Stepper activeStep={1} orientation="horizontal" size="md">
  <Step stepIndex={0}>
    <StepIndicator />
    <StepLabelGroup>
      <StepTitle>Account</StepTitle>
      <StepDescription>Configure credentials</StepDescription>
    </StepLabelGroup>
    <StepSeparator />
  </Step>
  <Step stepIndex={1}>
    <StepIndicator />
    <StepLabelGroup>
      <StepTitle>Profile</StepTitle>
      <StepDescription>Personal details</StepDescription>
    </StepLabelGroup>
    <StepSeparator />
  </Step>
  <Step stepIndex={2}>
    <StepIndicator />
    <StepLabelGroup>
      <StepTitle>Review</StepTitle>
      <StepDescription>Confirm & launch</StepDescription>
    </StepLabelGroup>
  </Step>
</Stepper>
```

### Title Only (Compact Wizard)
```tsx
<Stepper activeStep={1} size="md">
  <Step stepIndex={0}>
    <StepIndicator />
    <StepTitle>Account</StepTitle>
    <StepSeparator />
  </Step>
  <Step stepIndex={1}>
    <StepIndicator />
    <StepTitle>Profile</StepTitle>
    <StepSeparator />
  </Step>
  <Step stepIndex={2}>
    <StepIndicator />
    <StepTitle>Review</StepTitle>
  </Step>
</Stepper>
```

### Indicator Only (Dots / Step Numbers)
```tsx
<Stepper activeStep={1} size="sm">
  <Step stepIndex={0} aria-label="Step 1: Account">
    <StepIndicator />
    <StepSeparator />
  </Step>
  <Step stepIndex={1} aria-label="Step 2: Profile">
    <StepIndicator />
    <StepSeparator />
  </Step>
  <Step stepIndex={2} aria-label="Step 3: Review">
    <StepIndicator />
  </Step>
</Stepper>
```

## 3. Keyboard & Accessibility Contracts
- Container renders `<ol role="list">` with `aria-label` or progress semantics.
- Each step renders an `<li>` item with `data-status="complete" | "current" | "upcoming"`.
- The active step has `aria-current="step"`.
- In interactive mode (`clickable={true}`), each step renders an interactive `<button>` with native keyboard focus and optional `disabled` state.
- `StepIndicator` uses `aria-hidden="true"` so screen readers announce clean step titles or accessible labels without duplicate number readings.
- Focus rings snap into view immediately (`transition: none`, Rule 18).
- Separators are decorative (`aria-hidden="true"`).

## 4. Visual & Token Specifications
- **Colors**:
  - Completed: `--color-primary`, `--color-primary-foreground`
  - Current: `--color-surface`, border `--color-primary`, text `--color-primary`
  - Upcoming: `--color-surface`, border `--color-border-subtle`, text `--color-text-muted`
- **Sizing**:
  - Sm: 28px (`1.75rem`) indicator, 12px title
  - Md: 36px (`2.25rem`) indicator, 14px title
  - Lg: 44px (`2.75rem`) indicator, 16px title
- **Orientation**:
  - Horizontal: row layout with flexible auto-expanding separators between items (`flex: 1`)
  - Vertical: grid column layout (`grid-template-columns: var(--_stepper-indicator-size) 1fr`) with automatically centered vertical connectors
- **Direction & Logical Properties**:
  - 100% CSS logical properties (`margin-inline`, `padding-block`, `inset-inline-start`).
  - Seamless LTR and RTL mirroring. Zero horizontal shadow offsets. Dashboard is 100% shadow-free.

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabelGroup,
  StepSeparator,
  StepTitle,
  Stepper,
} from './stepper';

describe('Stepper Primitive', () => {
  it('renders ordered list with progress semantics', () => {
    render(
      <Stepper activeStep={1} aria-label="Progress">
        <Step stepIndex={0}>
          <StepIndicator />
          <StepLabelGroup>
            <StepTitle>Account</StepTitle>
          </StepLabelGroup>
          <StepSeparator />
        </Step>
        <Step stepIndex={1}>
          <StepIndicator />
          <StepLabelGroup>
            <StepTitle>Profile</StepTitle>
          </StepLabelGroup>
          <StepSeparator />
        </Step>
        <Step stepIndex={2}>
          <StepIndicator />
          <StepLabelGroup>
            <StepTitle>Review</StepTitle>
          </StepLabelGroup>
        </Step>
      </Stepper>,
    );

    const list = screen.getByRole('list', { name: /progress/i });
    expect(list).toBeTruthy();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);

    // Step 0: complete
    expect(items[0].getAttribute('data-status')).toBe('complete');
    expect(items[0].getAttribute('aria-current')).toBeNull();

    // Step 1: current
    expect(items[1].getAttribute('data-status')).toBe('current');
    expect(items[1].getAttribute('aria-current')).toBe('step');

    // Step 2: upcoming
    expect(items[2].getAttribute('data-status')).toBe('upcoming');
    expect(items[2].getAttribute('aria-current')).toBeNull();
  });

  it('supports clickable step navigation', () => {
    const handleStepClick = vi.fn();

    render(
      <Stepper activeStep={1} clickable onStepClick={handleStepClick}>
        <Step stepIndex={0}>
          <StepIndicator />
          <StepTitle>Step 1</StepTitle>
        </Step>
        <Step stepIndex={1}>
          <StepIndicator />
          <StepTitle>Step 2</StepTitle>
        </Step>
        <Step stepIndex={2}>
          <StepIndicator />
          <StepTitle>Step 3</StepTitle>
        </Step>
      </Stepper>,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    fireEvent.click(buttons[0]);
    expect(handleStepClick).toHaveBeenCalledWith(0);

    fireEvent.click(buttons[2]);
    expect(handleStepClick).toHaveBeenCalledWith(2);
  });

  it('does not fire click when step is disabled', () => {
    const handleStepClick = vi.fn();

    render(
      <Stepper activeStep={1} clickable onStepClick={handleStepClick}>
        <Step stepIndex={0}>
          <StepIndicator />
          <StepTitle>Step 1</StepTitle>
        </Step>
        <Step stepIndex={1} disabled>
          <StepIndicator />
          <StepTitle>Step 2</StepTitle>
        </Step>
      </Stepper>,
    );

    const buttons = screen.getAllByRole('button');
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(buttons[1]);
    expect(handleStepClick).not.toHaveBeenCalled();
  });

  it('supports vertical orientation and descriptions', () => {
    render(
      <Stepper activeStep={0} orientation="vertical" aria-label="Progress">
        <Step stepIndex={0}>
          <StepIndicator />
          <StepLabelGroup>
            <StepTitle>Deployment</StepTitle>
            <StepDescription>Building production assets</StepDescription>
          </StepLabelGroup>
        </Step>
      </Stepper>,
    );

    const list = screen.getByRole('list', { name: /progress/i });
    expect(list.getAttribute('data-orientation')).toBe('vertical');
    expect(screen.getByText('Building production assets')).toBeTruthy();
  });

  it('renders size tokens and data-size correctly', () => {
    const { rerender } = render(
      <Stepper activeStep={0} size="sm">
        <Step stepIndex={0}>
          <StepIndicator />
          <StepTitle>Small</StepTitle>
        </Step>
      </Stepper>,
    );

    const list = screen.getByRole('list');
    expect(list.getAttribute('data-size')).toBe('sm');

    rerender(
      <Stepper activeStep={0} size="lg">
        <Step stepIndex={0}>
          <StepIndicator />
          <StepTitle>Large</StepTitle>
        </Step>
      </Stepper>,
    );
    expect(list.getAttribute('data-size')).toBe('lg');
  });

  it('allows overriding status explicitly on a step', () => {
    render(
      <Stepper activeStep={0}>
        <Step stepIndex={0} status="complete">
          <StepIndicator />
          <StepTitle>Force Complete</StepTitle>
        </Step>
      </Stepper>,
    );

    const item = screen.getByRole('listitem');
    expect(item.getAttribute('data-status')).toBe('complete');
  });

  it('renders custom indicator content when provided', () => {
    render(
      <Stepper activeStep={0}>
        <Step stepIndex={0}>
          <StepIndicator>Custom-Icon</StepIndicator>
          <StepTitle>Step 1</StepTitle>
        </Step>
      </Stepper>,
    );

    expect(screen.getByText('Custom-Icon')).toBeTruthy();
  });

  it('throws error when Step is rendered outside Stepper', () => {
    expect(() => {
      render(
        <Step stepIndex={0}>
          <StepIndicator />
          <StepTitle>Orphan</StepTitle>
        </Step>,
      );
    }).toThrow('Stepper compound components must be rendered inside <Stepper>');
  });

  it('throws error when Step subcomponents are rendered outside Step', () => {
    expect(() => {
      render(
        <Stepper>
          <StepIndicator />
        </Stepper>,
      );
    }).toThrow('Step subcomponents must be rendered inside <Step>');
  });
});

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MirroredIcon } from './mirrored-icon';
import { I18nProvider } from './i18n-provider';

describe('MirroredIcon', () => {
  it('renders unmirrored in LTR mode', () => {
    const { container } = render(
      <I18nProvider defaultDirection="ltr">
        <MirroredIcon>
          <svg data-testid="icon" />
        </MirroredIcon>
      </I18nProvider>,
    );

    const wrapper = container.querySelector('[data-mirror-rtl="true"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('data-is-mirrored')).toBe('false');
  });

  it('mirrors automatically in RTL mode', () => {
    const { container } = render(
      <I18nProvider defaultDirection="rtl">
        <MirroredIcon>
          <svg data-testid="icon" />
        </MirroredIcon>
      </I18nProvider>,
    );

    const wrapper = container.querySelector('[data-mirror-rtl="true"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('data-is-mirrored')).toBe('true');
  });

  it('supports forceMirror prop', () => {
    const { container } = render(
      <I18nProvider defaultDirection="ltr">
        <MirroredIcon forceMirror>
          <svg data-testid="icon" />
        </MirroredIcon>
      </I18nProvider>,
    );

    const wrapper = container.querySelector('[data-mirror-rtl="true"]');
    expect(wrapper?.getAttribute('data-is-mirrored')).toBe('true');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Avatar,
  AvatarGroup,
  extractInitials,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
} from './index';

describe('extractInitials utility', () => {
  it('extracts first and last letters for multi-word names', () => {
    expect(extractInitials('John Doe')).toBe('JD');
    expect(extractInitials('Sarah Jessica Parker')).toBe('SP');
  });

  it('extracts up to two characters for single-word names', () => {
    expect(extractInitials('Alice')).toBe('AL');
    expect(extractInitials('A')).toBe('A');
  });

  it('handles Arabic and non-Latin names gracefully', () => {
    expect(extractInitials('طارق علي')).toBe('طع');
    expect(extractInitials('فاطمة')).toBe('فا');
  });

  it('respects explicit initials prop override', () => {
    expect(extractInitials('John Doe', 'AB')).toBe('AB');
    expect(extractInitials(undefined, 'xy')).toBe('XY');
  });

  it('returns empty string when no name or initials provided', () => {
    expect(extractInitials()).toBe('');
    expect(extractInitials('   ')).toBe('');
  });
});

describe('Avatar Primitive', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    const img = screen.getByRole('img', { name: 'User Avatar' });
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('transitions to initials when image encounters an error', () => {
    render(
      <Avatar
        src="https://example.com/broken.jpg"
        name="Alex Mercer"
        data-testid="avatar-broken"
      />,
    );

    const img = screen.getByRole('img', { name: 'Alex Mercer' });
    fireEvent.error(img);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('AM')).toBeDefined();
  });

  it('renders initials when no src is provided but name is present', () => {
    render(<Avatar name="Bruce Wayne" />);
    expect(screen.getByText('BW')).toBeDefined();
  });

  it('renders anonymous fallback icon when neither src nor name is provided', () => {
    const { container } = render(<Avatar data-testid="avatar-anon" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg).not.toBeNull();
  });

  it('applies all 6 sizing steps via data-size attribute', () => {
    const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    sizes.forEach((size) => {
      const { unmount } = render(<Avatar size={size} data-testid={`avatar-${size}`} name="Test" />);
      const el = screen.getByTestId(`avatar-${size}`);
      expect(el.getAttribute('data-size')).toBe(size);
      unmount();
    });
  });

  it('applies shape variations via data-shape attribute', () => {
    const shapes: AvatarShape[] = ['circle', 'rounded'];

    shapes.forEach((shape) => {
      const { unmount } = render(
        <Avatar shape={shape} data-testid={`avatar-${shape}`} name="Test" />,
      );
      const el = screen.getByTestId(`avatar-${shape}`);
      expect(el.getAttribute('data-shape')).toBe(shape);
      unmount();
    });
  });

  it('renders status indicator with accessible role when statusAriaLabel is passed and decorative without hardcoded fallback', () => {
    const statuses: AvatarStatus[] = ['online', 'offline', 'away', 'busy'];

    statuses.forEach((status) => {
      const { unmount } = render(
        <Avatar
          name="User"
          status={status}
          statusAriaLabel={`Status: ${status}`}
          data-testid={`avatar-status-${status}`}
        />,
      );
      const statusDot = screen.getByRole('status');
      expect(statusDot.getAttribute('aria-label')).toBe(`Status: ${status}`);
      unmount();
    });

    const { container } = render(<Avatar name="User" status="online" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')?.getAttribute('aria-label')).toBeNull();
  });

  it('keeps informative initials readable while hiding initials for explicit alt="" decorative avatars', () => {
    const { rerender } = render(<Avatar name="Bruce Wayne" />);
    const initials = screen.getByText('BW');
    expect(initials.getAttribute('aria-hidden')).toBeNull();

    rerender(<Avatar name="Bruce Wayne" alt="" />);
    expect(screen.getByText('BW').getAttribute('aria-hidden')).toBe('true');
  });

  it('supports custom host imageComponent slot', () => {
    const CustomImage = ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img src={src} alt={alt} data-custom-slot="true" {...rest} />
    );

    render(
      <Avatar
        src="https://example.com/custom.jpg"
        alt="Custom Slot"
        imageComponent={CustomImage}
      />,
    );

    const img = screen.getByRole('img', { name: 'Custom Slot' });
    expect(img.getAttribute('data-custom-slot')).toBe('true');
  });

  it('forwards ref to the outer container element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Avatar ref={ref} name="Forward Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('AvatarGroup Primitive', () => {
  it('renders children with group role', () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar name="User One" />
        <Avatar name="User Two" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeDefined();
    expect(screen.getByText('UO')).toBeDefined();
    expect(screen.getByText('UT')).toBeDefined();
  });

  it('truncates avatars, displays dir="ltr" +N counter without hardcoded English fallback, and applies overflowAriaLabel', () => {
    const { rerender } = render(
      <AvatarGroup max={2}>
        <Avatar name="Alpha Beta" />
        <Avatar name="Gamma Delta" />
        <Avatar name="Epsilon Zeta" />
        <Avatar name="Eta Theta" />
      </AvatarGroup>,
    );

    expect(screen.getByText('AB')).toBeDefined();
    expect(screen.getByText('GD')).toBeDefined();
    expect(screen.queryByText('EZ')).toBeNull();
    expect(screen.queryByText('ET')).toBeNull();
    const counter = screen.getByText('+2');
    expect(counter.getAttribute('dir')).toBe('ltr');
    expect(screen.queryByLabelText(/more/i)).toBeNull();

    rerender(
      <AvatarGroup max={2} overflowAriaLabel="+2 more members">
        <Avatar name="Alpha Beta" />
        <Avatar name="Gamma Delta" />
        <Avatar name="Epsilon Zeta" />
        <Avatar name="Eta Theta" />
      </AvatarGroup>,
    );
    expect(screen.getByLabelText('+2 more members')).toBeDefined();
  });

  it('propagates size and shape down to member avatars', () => {
    render(
      <AvatarGroup size="lg" shape="rounded" data-testid="group-props">
        <Avatar name="User A" data-testid="member-a" />
      </AvatarGroup>,
    );

    const member = screen.getByTestId('member-a');
    expect(member.getAttribute('data-size')).toBe('lg');
    expect(member.getAttribute('data-shape')).toBe('rounded');
  });
});

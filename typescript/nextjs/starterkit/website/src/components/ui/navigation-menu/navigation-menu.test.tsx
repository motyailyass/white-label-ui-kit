import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu';

describe('NavigationMenu', () => {
  it('renders navigation landmark with menubar list and orientation attributes', () => {
    render(
      <NavigationMenu aria-label="Main Navigation" orientation="vertical" data-testid="nav">
        <NavigationMenuList data-testid="list">
          <NavigationMenuItem>
            <NavigationMenuLink href="/home">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const nav = screen.getByTestId('nav');
    expect(nav.getAttribute('aria-label')).toBe('Main Navigation');
    expect(nav.getAttribute('data-orientation')).toBe('vertical');

    const list = screen.getByTestId('list');
    expect(list.getAttribute('role')).toBe('menubar');
    expect(list.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('toggles menu content visibility on trigger click and auto-closes when a flyout link is clicked', () => {
    const onValueChange = vi.fn();

    render(
      <NavigationMenu onValueChange={onValueChange}>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger data-testid="trigger">Products</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content">
              <NavigationMenuLink href="#analytics" icon="chart" data-testid="flyout-link">
                Analytics
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('content')).toBeNull();

    // Click to open
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(onValueChange).toHaveBeenLastCalledWith('products');
    const content = screen.getByTestId('content');
    expect(content.getAttribute('role')).toBe('menu');
    expect(content.textContent).toContain('Analytics');

    // Click flyout link to auto-close
    fireEvent.click(screen.getByTestId('flyout-link'));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('closes open content on Escape and restores focus to the trigger when focus was inside the menu', () => {
    render(
      <NavigationMenu defaultValue="docs" data-testid="nav">
        <NavigationMenuList>
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger data-testid="trigger">Docs</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content">
              <NavigationMenuLink href="#intro" data-testid="intro-link">
                Introduction
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    const introLink = screen.getByTestId('intro-link');
    introLink.focus();
    expect(document.activeElement).toBe(introLink);

    fireEvent.keyDown(introLink, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('content')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('supports keyboard navigation across top-level items (including RTL inversion) and inside flyout content', () => {
    render(
      <div dir="rtl">
        <NavigationMenu defaultValue="products">
          <NavigationMenuList data-testid="list">
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger data-testid="trigger-products">Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#a" data-testid="sub-a">
                  Item A
                </NavigationMenuLink>
                <NavigationMenuLink href="#b" data-testid="sub-b">
                  Item B
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="pricing">
              <NavigationMenuLink href="#pricing" data-testid="top-pricing">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>,
    );

    const triggerProducts = screen.getByTestId('trigger-products');
    const topPricing = screen.getByTestId('top-pricing');
    triggerProducts.focus();

    // In RTL, ArrowLeft moves to next top-level item
    fireEvent.keyDown(triggerProducts, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(topPricing);

    // ArrowRight moves back to previous top-level item in RTL
    fireEvent.keyDown(topPricing, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(triggerProducts);

    // Inside flyout, ArrowDown / ArrowUp traverses menu items
    const subA = screen.getByTestId('sub-a');
    const subB = screen.getByTestId('sub-b');
    subA.focus();
    fireEvent.keyDown(subA, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(subB);
    fireEvent.keyDown(subB, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(subA);
  });

  it('supports polymorphic rendering and disabled state on NavigationMenuLink', () => {
    const onClick = vi.fn();
    render(
      <NavigationMenuLink as="span" active disabled onClick={onClick} data-testid="custom-link">
        Active Item
      </NavigationMenuLink>,
    );

    const link = screen.getByTestId('custom-link');
    expect(link.tagName).toBe('SPAN');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('data-active')).toBe('true');

    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});

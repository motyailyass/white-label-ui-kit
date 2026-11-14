import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TreeNode, TreeView } from './tree-view';

describe('TreeView', () => {
  it('renders root tree element with tree role and meta badges', () => {
    render(
      <TreeView aria-label="Project Structure" data-testid="tree">
        <TreeNode id="root-1" label="Root 1" icon="folder" meta="2 items" />
      </TreeView>,
    );

    const tree = screen.getByTestId('tree');
    expect(tree.getAttribute('role')).toBe('tree');
    expect(tree.getAttribute('aria-label')).toBe('Project Structure');
    expect(screen.getByText('2 items')).toBeTruthy();
  });

  it('handles item selection and expansion on click', () => {
    const handleSelect = vi.fn();
    const handleExpandedChange = vi.fn();

    render(
      <TreeView
        aria-label="Project tree"
        onSelect={handleSelect}
        onExpandedChange={handleExpandedChange}
      >
        <TreeNode id="docs" label="Documents" data-testid="node-docs">
          <TreeNode id="doc-1" label="Doc 1" data-testid="node-doc-1" />
        </TreeNode>
        <TreeNode id="images" label="Images" data-testid="node-images" />
      </TreeView>,
    );

    const docsItem = screen.getByTestId('node-docs');
    expect(docsItem.getAttribute('aria-expanded')).toBe('false');

    const docsBtn = docsItem.querySelector('button');
    expect(docsBtn).not.toBeNull();
    fireEvent.click(docsBtn!);

    expect(handleSelect).toHaveBeenCalledWith('docs');
    expect(handleExpandedChange).toHaveBeenCalledWith(['docs']);
    expect(docsItem.getAttribute('aria-expanded')).toBe('true');

    // Click child node
    const childItem = screen.getByTestId('node-doc-1');
    const childBtn = childItem.querySelector('button');
    fireEvent.click(childBtn!);

    expect(handleSelect).toHaveBeenCalledWith('doc-1');
    expect(childItem.getAttribute('aria-selected')).toBe('true');
  });

  it('supports WAI-ARIA keyboard navigation (ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Home, End)', () => {
    render(
      <TreeView aria-label="Project tree" defaultExpandedIds={[]}>
        <TreeNode id="src" label="src" data-testid="node-src">
          <TreeNode id="index" label="index.ts" data-testid="node-index" />
        </TreeNode>
        <TreeNode id="pkg" label="package.json" data-testid="node-pkg" />
      </TreeView>,
    );

    const srcItem = screen.getByTestId('node-src');
    const srcBtn = srcItem.querySelector('button')!;
    const indexItem = screen.getByTestId('node-index');
    const indexBtn = indexItem.querySelector('button')!;
    const pkgItem = screen.getByTestId('node-pkg');
    const pkgBtn = pkgItem.querySelector('button')!;

    expect(srcItem.getAttribute('aria-expanded')).toBe('false');

    // ArrowRight expands closed branch
    fireEvent.keyDown(srcBtn, { key: 'ArrowRight' });
    expect(srcItem.getAttribute('aria-expanded')).toBe('true');

    // Second ArrowRight moves focus to first child
    fireEvent.keyDown(srcBtn, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(indexBtn);

    // ArrowDown moves focus to next visible node (pkgBtn)
    fireEvent.keyDown(indexBtn, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(pkgBtn);

    // Home jumps to first visible node (srcBtn)
    fireEvent.keyDown(pkgBtn, { key: 'Home' });
    expect(document.activeElement).toBe(srcBtn);

    // End jumps to last visible node (pkgBtn)
    fireEvent.keyDown(srcBtn, { key: 'End' });
    expect(document.activeElement).toBe(pkgBtn);

    // ArrowUp moves focus to previous visible node (indexBtn)
    fireEvent.keyDown(pkgBtn, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(indexBtn);

    // ArrowLeft on leaf node moves focus back to parent branch (srcBtn)
    fireEvent.keyDown(indexBtn, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(srcBtn);

    // ArrowLeft on open branch collapses it
    fireEvent.keyDown(srcBtn, { key: 'ArrowLeft' });
    expect(srcItem.getAttribute('aria-expanded')).toBe('false');
  });

  it('inverts ArrowLeft and ArrowRight in RTL subtrees', () => {
    render(
      <div dir="rtl">
        <TreeView aria-label="Project tree" defaultExpandedIds={[]}>
          <TreeNode id="src" label="src" data-testid="node-src">
            <TreeNode id="index" label="index.ts" />
          </TreeNode>
        </TreeView>
      </div>,
    );

    const srcItem = screen.getByTestId('node-src');
    const srcBtn = srcItem.querySelector('button')!;

    // In RTL, ArrowLeft expands closed branch
    fireEvent.keyDown(srcBtn, { key: 'ArrowLeft' });
    expect(srcItem.getAttribute('aria-expanded')).toBe('true');

    // In RTL, ArrowRight collapses open branch
    fireEvent.keyDown(srcBtn, { key: 'ArrowRight' });
    expect(srcItem.getAttribute('aria-expanded')).toBe('false');
  });

  it('respects disabled state on both individual nodes and root TreeView', () => {
    const handleSelect = vi.fn();

    const { rerender } = render(
      <TreeView aria-label="Project tree" onSelect={handleSelect}>
        <TreeNode id="disabled-node" label="Disabled" disabled data-testid="node-disabled" />
      </TreeView>,
    );

    const item = screen.getByTestId('node-disabled');
    expect(item.getAttribute('aria-disabled')).toBe('true');

    const btn = item.querySelector('button')!;
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn);
    expect(handleSelect).not.toHaveBeenCalled();

    rerender(
      <TreeView aria-label="Project tree" disabled onSelect={handleSelect}>
        <TreeNode id="enabled-node" label="Node" data-testid="node-enabled" />
      </TreeView>,
    );

    const enabledItem = screen.getByTestId('node-enabled');
    expect(enabledItem.getAttribute('aria-disabled')).toBe('true');
  });

  it('names the tree from aria-labelledby and never injects a default name', () => {
    render(
      <>
        <span id="tree-heading">Files</span>
        <TreeView aria-labelledby="tree-heading">
          <TreeNode id="a" label="A" />
        </TreeView>
      </>,
    );

    const tree = screen.getByRole('tree', { name: 'Files' });
    expect(tree.hasAttribute('aria-label')).toBe(false);
  });
});

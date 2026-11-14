'use client';

import { forwardRef } from 'react';
import { SearchInput, type SearchInputProps } from '@/components/ui/search-input';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface SidebarSearchProps extends SearchInputProps {
  wrapperClassName?: string;
}

export const SidebarSearch = forwardRef<HTMLInputElement, SidebarSearchProps>(
  function SidebarSearch(
    { size = 'sm', variant = 'subtle', wrapperClassName, className, ...props },
    ref,
  ) {
    return (
      <div className={cn(styles.searchSlot, wrapperClassName)}>
        <SearchInput ref={ref} size={size} variant={variant} className={className} {...props} />
      </div>
    );
  },
);

SidebarSearch.displayName = 'SidebarSearch';

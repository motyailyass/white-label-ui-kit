'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '../error-state';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Client subtree Error Boundary.
 * Catches JavaScript errors anywhere in their child component tree (e.g. charts, widgets),
 * logs those errors, and displays a fallback UI instead of crashing the entire route.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorState
          title={this.props.title}
          description={this.props.description}
          error={this.state.error}
          onRetry={this.reset}
          showHome={false}
        />
      );
    }

    return this.props.children;
  }
}

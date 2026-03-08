"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center rounded-lg border border-border-subtle bg-surface-1 p-8">
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-2xl text-danger">
              !
            </div>
            <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
            <p className="mt-2 text-base text-text-secondary">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
              >
                Try Again
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary">
                  Error details
                </summary>
                <pre className="mt-2 max-w-lg overflow-auto rounded-lg bg-bg-base p-4 text-xs text-danger">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Loading...</h1>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', toError(error), info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error !== null && prevProps.resetKey !== this.props.resetKey) this.resetError();
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <div className="paper-card w-full max-w-lg rounded-2xl p-6 text-center">
          <h1 className="display-font text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">This page hit an error. Your notebook is still saved on this device.</p>
          {import.meta.env.DEV && (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 text-left text-xs">{error.message || String(error)}</pre>
          )}
          <button type="button" onClick={this.resetError} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      </div>
    );
  }
}

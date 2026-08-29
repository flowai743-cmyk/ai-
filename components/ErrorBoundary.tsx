"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Caught in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-3 my-2">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold font-mono uppercase">
              {this.props.fallbackTitle || "Component Telemetry Notice"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            {this.state.error?.message || "An external script error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition"
          >
            <RefreshCw className="w-3 h-3" /> Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center p-4">
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full text-center">
            <div className="text-6xl mb-6">😰</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Ceva nu a mers bine
            </h1>
            <p className="text-white/80 mb-6">
              Ne pare rău, dar a apărut o eroare neașteptată. Echipa noastră a fost notificată.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-white/70 cursor-pointer text-sm mb-2">
                  Detalii tehnice (click pentru a vedea)
                </summary>
                <pre className="text-xs text-white/60 bg-black/20 p-3 rounded-lg overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300"
              >
                Încearcă din nou
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300"
              >
                Înapoi la pagina principală
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // In a real app, log to Sentry/DataDog here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-8">
              We encountered an unexpected error. Please try refreshing the page or go back home.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white">
                <RefreshCw size={18} className="mr-2" /> Refresh Page
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full justify-center">
                <Home size={18} className="mr-2" /> Go Home
              </Button>
            </div>
            {this.state.error && (
              <div className="mt-8 text-left bg-slate-100 p-4 rounded-xl overflow-auto text-xs text-slate-700 max-h-48 border border-slate-200">
                <p className="font-bold mb-2 text-rose-600">{this.state.error.toString()}</p>
                <pre>{this.state.error?.stack}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

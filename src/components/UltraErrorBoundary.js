import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class UltraErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isDOMError: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a DOM manipulation error we should ignore
    if (error && error.message && (
      error.message.includes('insertBefore') ||
      error.message.includes('appendChild') ||
      error.message.includes('removeChild') ||
      error.message.includes('Cannot deserialize') ||
      error.message.includes('JSON parse error') ||
      error.message.includes('NotFoundError') ||
      error.message.includes('Node')
    )) {
      console.warn('🛡️ DOM error caught and SUPPRESSED by ErrorBoundary:', error.message);
      // Return normal state - do not show error UI for DOM errors
      return { hasError: false, isDOMError: true };
    }
    
    // Only show error UI for actual application errors
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('🚫 ErrorBoundary caught an error:', error);
    
    // Check if this is a DOM manipulation error
    if (error && error.message && (
      error.message.includes('insertBefore') ||
      error.message.includes('appendChild') ||
      error.message.includes('removeChild') ||
      error.message.includes('Cannot deserialize') ||
      error.message.includes('JSON parse error') ||
      error.message.includes('NotFoundError') ||
      error.message.includes('Node')
    )) {
      console.warn('🛡️ DOM/Parse error caught and SUPPRESSED:', error.message);
      // Do not set error state for DOM errors
      this.setState({ 
        hasError: false, 
        isDOMError: true,
        error: null,
        errorInfo: null 
      });
      return;
    }
    
    // Only set error state for real application errors
    this.setState({
      error: error,
      errorInfo: errorInfo,
      hasError: true,
      isDOMError: false
    });
  }

  render() {
    // Only show error UI for non-DOM errors
    if (this.state.hasError && !this.state.isDOMError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Đã xảy ra lỗi
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử lại.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tải lại trang
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null, isDOMError: false })}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Thử lại
              </button>
            </div>
            
            {/* Hide error details in production */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">Chi tiết lỗi (Development)</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // For DOM errors or no errors, render children normally
    return this.props.children;
  }
}

export default UltraErrorBoundary;
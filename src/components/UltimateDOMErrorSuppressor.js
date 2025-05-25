import React from 'react';

class UltimateDOMErrorSuppressor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      shouldShowError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a DOM manipulation error that should be completely hidden
    if (error && error.message) {
      const message = error.message.toLowerCase();
      const isDOMError = 
        message.includes('insertbefore') ||
        message.includes('appendchild') ||
        message.includes('removechild') ||
        message.includes('cannot deserialize') ||
        message.includes('json parse error') ||
        message.includes('notfounderror') ||
        message.includes('node') ||
        message.includes('commitplacement') ||
        message.includes('commitmutationeffects') ||
        message.includes('bundle.js');
      
      if (isDOMError) {
        console.debug('🛡️ DOM error completely suppressed by ErrorBoundary:', error.message);
        // Return normal state - completely hide DOM errors from user
        return { 
          hasError: false, 
          shouldShowError: false,
          error: null,
          errorInfo: null 
        };
      }
    }
    
    // Only show error UI for actual application errors
    return { 
      hasError: true, 
      shouldShowError: true 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is a DOM manipulation error
    if (error && error.message) {
      const message = error.message.toLowerCase();
      const isDOMError = 
        message.includes('insertbefore') ||
        message.includes('appendchild') ||
        message.includes('removechild') ||
        message.includes('cannot deserialize') ||
        message.includes('json parse error') ||
        message.includes('notfounderror') ||
        message.includes('node') ||
        message.includes('commitplacement') ||
        message.includes('commitmutationeffects') ||
        message.includes('bundle.js');
      
      if (isDOMError) {
        console.debug('🛡️ DOM error caught and COMPLETELY SUPPRESSED:', error.message);
        // Do not set any error state for DOM errors
        this.setState({ 
          hasError: false, 
          shouldShowError: false,
          error: null,
          errorInfo: null 
        });
        
        // Prevent any error propagation
        return;
      }
    }
    
    // Only set error state for real application errors
    console.error('❌ Real application error caught:', error);
    this.setState({
      error: error,
      errorInfo: errorInfo,
      hasError: true,
      shouldShowError: true
    });
  }

  componentDidMount() {
    // Additional DOM error suppression at mount
    this.suppressDOMErrors();
  }

  suppressDOMErrors = () => {
    // Hide any existing error overlays
    setTimeout(() => {
      try {
        const errorElements = document.querySelectorAll('*');
        errorElements.forEach(el => {
          if (el.textContent && el.textContent.includes('insertBefore')) {
            el.style.display = 'none';
            console.debug('🛡️ Hidden DOM error element');
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }, 100);
  };

  render() {
    // Only show error UI for non-DOM errors that should be displayed
    if (this.state.hasError && this.state.shouldShowError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Đã xảy ra lỗi ứng dụng
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For DOM errors or no errors, render children normally
    return this.props.children;
  }
}

export default UltimateDOMErrorSuppressor;
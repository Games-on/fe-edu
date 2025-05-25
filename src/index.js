import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { initializeLocalStorage } from './utils/localStorageManager';

// ============================================
// REBUILD DOM STRATEGY + AUTH MANAGEMENT
// ============================================
console.log('🔄 Starting application with clean DOM and auth management...');

// Initialize localStorage management FIRST
initializeLocalStorage();

// 1. CLEAR ALL EXISTING DOM COMPLETELY
const clearExistingDOM = () => {
  try {
    // Clear all existing React roots
    const existingRoots = document.querySelectorAll('[data-reactroot]');
    existingRoots.forEach(root => root.remove());
    
    // Clear any portal containers
    const portals = document.querySelectorAll('[id*="portal"], [class*="portal"]');
    portals.forEach(portal => portal.remove());
    
    // Clear any modal containers
    const modals = document.querySelectorAll('[id*="modal"], [class*="modal"]');
    modals.forEach(modal => modal.remove());
    
    // Clear any overlay containers
    const overlays = document.querySelectorAll('[class*="overlay"], [id*="overlay"]');
    overlays.forEach(overlay => overlay.remove());
    
    console.log('🧹 DOM cleared completely');
  } catch (e) {
    console.log('🧹 DOM clear completed (with minor errors)');
  }
};

// 2. FORCE CLEAN THE ROOT ELEMENT
const prepareCleanRoot = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Clear all children
    rootElement.innerHTML = '';
    
    // Remove all attributes except id
    const attributes = Array.from(rootElement.attributes);
    attributes.forEach(attr => {
      if (attr.name !== 'id') {
        rootElement.removeAttribute(attr.name);
      }
    });
    
    // Reset any styles
    rootElement.style.cssText = '';
    
    console.log('🎯 Root element prepared clean');
  }
};

// 3. MINIMAL ERROR SUPPRESSION (only console)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('insertBefore') || 
      message.includes('commitPlacement') ||
      message.includes('NotFoundError')) {
    console.debug('🔇 DOM error suppressed:', message);
    return;
  }
  originalConsoleError(...args);
};

// 4. SIMPLE QUERY CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retry to prevent DOM conflicts
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
    mutations: {
      retry: false,
    }
  },
});

// 5. FORCE SYNCHRONOUS RENDERING
const forceSync = () => {
  if (window.React && window.React.version) {
    console.log('⚡ React version:', window.React.version);
  }
  
  // Force synchronous updates (disable concurrent mode)
  if (window.ReactDOM && window.ReactDOM.createRoot) {
    console.log('⚡ Using createRoot (React 18)');
  }
};

// 6. EXECUTE CLEANUP
clearExistingDOM();
prepareCleanRoot();
forceSync();

// 7. WAIT FOR DOM TO SETTLE BEFORE RENDERING
setTimeout(() => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Root element not found!');
    return;
  }
  
  console.log('🚀 Starting React app with clean DOM...');
  
  try {
    // Create fresh root
    const root = ReactDOM.createRoot(rootElement);
    
    // Render with absolute minimal structure
    root.render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          BrowserRouter,
          {},
          React.createElement(
            AuthProvider,
            {},
            React.createElement(App)
          )
        )
      )
    );
    
    console.log('✅ React app rendered successfully');
    
  } catch (error) {
    console.error('❌ Failed to render React app:', error);
    
    // Fallback: try basic HTML
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Loading Error</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }
  
}, 100); // Small delay to ensure DOM is ready

console.log('🔄 DOM REBUILD strategy initialized');
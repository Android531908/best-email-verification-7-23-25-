import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced error handling and debugging
console.log('Starting application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;"><div style="text-align: center;"><h1 style="color: #333;">Loading...</h1><p>Initializing Curio Tutors...</p></div></div>';
} else {
  try {
    console.log('Root element found, creating React root...');
    const root = createRoot(rootElement);
    
    console.log('Rendering App component...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #333; margin-bottom: 20px;">Curio Tutors</h1>
          <p style="color: #666; margin-bottom: 20px;">We're having trouble loading the application. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="background: #4A7C59; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">Refresh Page</button>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">Error: ${error}</p>
        </div>
      </div>
    `;
  }
}

// Add global error handlers
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});
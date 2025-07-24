import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import VideoConferenceSchedule from './components/VideoConferenceSchedule';
import './index.css';

console.log('Starting Video Conferences page...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  try {
    console.log('Root element found, creating React root...');
    const root = createRoot(rootElement);
    
    console.log('Rendering VideoConferenceSchedule component...');
    root.render(
      <StrictMode>
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
          <VideoConferenceSchedule
            onBack={() => {
              if (window.opener) {
                window.close();
              } else {
                window.location.href = '/';
              }
            }}
            userData={{ firstName: 'Student' }}
          />
        </div>
      </StrictMode>
    );
    console.log('VideoConferenceSchedule rendered successfully');
  } catch (error) {
    console.error('Error rendering video conferences:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #333; margin-bottom: 20px;">Video Conferences</h1>
          <p style="color: #666; margin-bottom: 20px;">We're having trouble loading the video conferences. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="background: #4A7C59; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">Refresh Page</button>
        </div>
      </div>
    `;
  }
}
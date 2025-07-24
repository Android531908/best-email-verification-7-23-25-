import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import VideoConferenceApp from './components/VideoConference/VideoConferenceApp';
import './index.css';

console.log('Starting Video Conference page...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  try {
    console.log('Root element found, creating React root...');
    const root = createRoot(rootElement);
    
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get('meetingId');
    const password = params.get('password');
    const subject = params.get('subject');
    const instructor = params.get('instructor');
    
    console.log('Rendering VideoConferenceApp component...');
    root.render(
      <StrictMode>
        <VideoConferenceApp
          user={{
            id: 'student-123',
            name: 'Student',
            email: 'student@curiotutors.com',
            role: 'student',
            verified: true
          }}
          onExit={() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/';
            }
          }}
        />
      </StrictMode>
    );
    console.log('VideoConferenceApp rendered successfully');
  } catch (error) {
    console.error('Error rendering video conference:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #1f2937; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: white; margin-bottom: 20px;">Video Conference</h1>
          <p style="color: #d1d5db; margin-bottom: 20px;">We're having trouble loading the video conference. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="background: #4A7C59; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">Refresh Page</button>
        </div>
      </div>
    `;
  }
}
import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import VideoConferenceSchedule from './components/VideoConferenceSchedule';
import VideoConferenceApp from './components/VideoConference/VideoConferenceApp';
import VerifyEmailPage from './components/VerifyEmailPage';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

interface UserData {
  firstName: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'splash' | 'login' | 'dashboard' | 'video-conferences' | 'video-conference'>('splash');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [conferenceParams, setConferenceParams] = useState<any>(null);

  // Firebase Auth
  const { user, profile, loading: authLoading, isEmailVerified } = useFirebaseAuth();

  // Add timeout for auth loading to prevent infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading && currentPage === 'splash') {
        console.warn('Auth loading timeout, proceeding to login');
        setShowSplash(false);
        setCurrentPage('login');
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading, currentPage]);

  React.useEffect(() => {
    console.log('App component mounted');
    console.log('User agent:', navigator.userAgent);
    console.log('Screen dimensions:', window.screen.width, 'x', window.screen.height);
    console.log('Viewport dimensions:', window.innerWidth, 'x', window.innerHeight);
    
    // Check URL for video conference routes
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Handle Firebase Auth action URLs (email verification, password reset)
    if (params.get('mode') && params.get('oobCode')) {
      setCurrentPage('verify');
      setShowSplash(false);
    } else if (path === '/video-conferences') {
      setCurrentPage('video-conferences');
      setShowSplash(false);
    } else if (path === '/video-conference') {
      setCurrentPage('video-conference');
      setShowSplash(false);
      setConferenceParams({
        meetingId: params.get('meetingId'),
        password: params.get('password'),
        subject: params.get('subject'),
        instructor: params.get('instructor')
      });
      setCurrentPage('verify');
      setShowSplash(false);
    }
  }, []);
  
  // Handle Firebase auth state changes
  React.useEffect(() => {
    if (!authLoading && user && isEmailVerified && profile) {
      // User is authenticated and verified
      setIsLoggedIn(true);
      setUserData({ firstName: profile.firstName });
      if (currentPage === 'login') {
        setCurrentPage('dashboard');
      }
    } else if (!authLoading && !user && isLoggedIn) {
      // User signed out
      setIsLoggedIn(false);
      setUserData(null);
      setCurrentPage('login');
    }
  }, [user, profile, isEmailVerified, authLoading, isLoggedIn, currentPage]);

  const handleSplashComplete = () => {
    console.log('Splash complete, transitioning to login...');
    setSplashFadeOut(true);
    setTimeout(() => {
      setShowSplash(false);
      setCurrentPage('login');
    }, 300);
  };

  const handleLogin = (user?: UserData) => {
    console.log('Login successful, transitioning to dashboard...');
    // Firebase auth will handle state updates automatically
    // This is kept for compatibility with existing flow
    if (user) {
      setUserData(user);
    }
  };

  const handleLogout = () => {
    console.log('Logout, returning to login...');
    // Firebase signOut will be called from the dashboard component
    // State updates will be handled by Firebase auth state listener
  };

  const handleBackToMain = () => {
    // Close the current window if it was opened as a popup
    if (window.opener) {
      window.close();
    } else {
      // Navigate back to main app
      window.location.href = '/';
    }
  };

  // Handle video conference routes
  if (currentPage === 'video-conferences') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <VideoConferenceSchedule
          onBack={handleBackToMain}
          userData={userData}
        />
      </div>
    );
  }

  if (currentPage === 'video-conference') {
    return (
      <div className="w-full min-h-screen">
        <VideoConferenceApp
          user={{
            id: 'student-123',
            name: userData?.firstName || 'Student',
            email: 'student@curiotutors.com',
            role: 'student',
            verified: true
          }}
          onExit={handleBackToMain}
        />
      </div>
    );
  }
  
  // Handle email verification page
  if (currentPage === 'verify') {
    return <VerifyEmailPage />;
  }
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 page-content">
      {showSplash ? (
        <div className={`fixed inset-0 w-full h-full transition-opacity duration-300 ease-in-out z-50 ${splashFadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <SplashScreen onComplete={handleSplashComplete} />
        </div>
      ) : null}
      
      {/* Main App Content */}
      <div className={`w-full min-h-screen scrollable-area ${showSplash ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`} style={{
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        height: 'auto',
        minHeight: '100vh'
      }}>
        {authLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-amber-800 font-medium">Loading...</p>
            </div>
          </div>
        ) : (
        currentPage === 'login' ? (
          <LoginPage onLogin={handleLogin} />
        ) : currentPage === 'dashboard' ? (
          <StudentDashboard onLogout={handleLogout} userData={userData} />
        ) : null
        )}
      </div>
    </div>
  );
}

export default App;
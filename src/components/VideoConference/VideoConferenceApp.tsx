import React, { useState, useEffect } from 'react';
import { VideoConferenceProvider } from './contexts/VideoConferenceContext';
import ConferenceRoom from './components/ConferenceRoom';
import JoinMeeting from './components/JoinMeeting';
import CreateMeeting from './components/CreateMeeting';
import MeetingLobby from './components/MeetingLobby';
import AdminDashboard from './components/AdminDashboard';
import { User, UserRole } from './types/conference.types';

interface VideoConferenceAppProps {
  user: User;
  onExit: () => void;
}

type AppState = 'join' | 'create' | 'lobby' | 'conference' | 'admin';

const VideoConferenceApp: React.FC<VideoConferenceAppProps> = ({ user, onExit }) => {
  const [currentState, setCurrentState] = useState<AppState>('join');
  const [meetingId, setMeetingId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Initialize WebRTC and check browser compatibility
    checkWebRTCSupport();
    initializeMediaDevices();
    
    // Set page title for video conference window
    document.title = 'Video Conference - Curio Tutors';
    
    // Add beforeunload handler to warn about leaving during a call
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the video conference?';
      return 'Are you sure you want to leave the video conference?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const checkWebRTCSupport = () => {
    if (!navigator.mediaDevices || !window.RTCPeerConnection) {
      alert('Your browser does not support video conferencing. Please use Chrome, Firefox, Safari, or Edge.');
      onExit();
    }
  };

  const initializeMediaDevices = async () => {
    try {
      // Check for camera and microphone permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (error) {
      console.warn('Media devices not accessible:', error);
    }
  };

  const handleJoinMeeting = (id: string, password: string) => {
    setMeetingId(id);
    setIsHost(false);
    setCurrentState('lobby');
  };

  const handleCreateMeeting = (id: string) => {
    setMeetingId(id);
    setIsHost(true);
    setCurrentState('lobby');
  };

  const handleEnterConference = () => {
    setCurrentState('conference');
  };

  const handleExitConference = () => {
    setCurrentState('join');
    setMeetingId('');
    setIsHost(false);
    
    // If this is a popup window, close it
    if (window.opener) {
      window.close();
    } else {
      // Otherwise, call the onExit callback
      onExit();
    }
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'join':
        return (
          <JoinMeeting
            onJoin={handleJoinMeeting}
            onCreateNew={() => setCurrentState('create')}
            onAdminPanel={() => setCurrentState('admin')}
            user={user}
          />
        );
      case 'create':
        return (
          <CreateMeeting
            onMeetingCreated={handleCreateMeeting}
            onBack={() => setCurrentState('join')}
            user={user}
          />
        );
      case 'lobby':
        return (
          <MeetingLobby
            meetingId={meetingId}
            isHost={isHost}
            user={user}
            onEnterConference={handleEnterConference}
            onExit={handleExitConference}
          />
        );
      case 'conference':
        return (
          <ConferenceRoom
            meetingId={meetingId}
            isHost={isHost}
            user={user}
            onExit={handleExitConference}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            user={user}
            onBack={() => setCurrentState('join')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <VideoConferenceProvider>
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 overflow-hidden">
        {renderCurrentState()}
      </div>
    </VideoConferenceProvider>
  );
};

export default VideoConferenceApp;
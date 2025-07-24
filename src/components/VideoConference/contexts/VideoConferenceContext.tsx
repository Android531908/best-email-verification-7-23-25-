import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  Meeting, 
  Participant, 
  ChatMessage, 
  MediaState, 
  DeviceInfo,
  WebRTCConfig,
  SecurityEvent 
} from '../types/conference.types';
import { WebRTCService } from '../services/WebRTCService';
import { SecurityService } from '../services/SecurityService';
import { AnalyticsService } from '../services/AnalyticsService';

interface VideoConferenceState {
  currentMeeting: Meeting | null;
  participants: Participant[];
  localParticipant: Participant | null;
  chatMessages: ChatMessage[];
  isConnected: boolean;
  isJoining: boolean;
  mediaDevices: DeviceInfo[];
  localMediaState: MediaState;
  screenShareStream: MediaStream | null;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkStats: {
    latency: number;
    packetLoss: number;
    bandwidth: { upload: number; download: number };
  };
  securityEvents: SecurityEvent[];
  isRecording: boolean;
  recordingDuration: number;
}

type VideoConferenceAction =
  | { type: 'SET_MEETING'; payload: Meeting }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'UPDATE_PARTICIPANT'; payload: { id: string; updates: Partial<Participant> } }
  | { type: 'SET_LOCAL_PARTICIPANT'; payload: Participant }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_JOINING_STATUS'; payload: boolean }
  | { type: 'SET_MEDIA_DEVICES'; payload: DeviceInfo[] }
  | { type: 'UPDATE_LOCAL_MEDIA_STATE'; payload: Partial<MediaState> }
  | { type: 'SET_SCREEN_SHARE_STREAM'; payload: MediaStream | null }
  | { type: 'UPDATE_CONNECTION_QUALITY'; payload: 'excellent' | 'good' | 'fair' | 'poor' }
  | { type: 'UPDATE_NETWORK_STATS'; payload: any }
  | { type: 'ADD_SECURITY_EVENT'; payload: SecurityEvent }
  | { type: 'SET_RECORDING_STATUS'; payload: boolean }
  | { type: 'UPDATE_RECORDING_DURATION'; payload: number }
  | { type: 'RESET_STATE' };

const initialState: VideoConferenceState = {
  currentMeeting: null,
  participants: [],
  localParticipant: null,
  chatMessages: [],
  isConnected: false,
  isJoining: false,
  mediaDevices: [],
  localMediaState: {
    audioEnabled: false,
    videoEnabled: false,
    screenShareEnabled: false,
    audioLevel: 0,
    videoQuality: '720p'
  },
  screenShareStream: null,
  connectionQuality: 'good',
  networkStats: {
    latency: 0,
    packetLoss: 0,
    bandwidth: { upload: 0, download: 0 }
  },
  securityEvents: [],
  isRecording: false,
  recordingDuration: 0
};

function videoConferenceReducer(
  state: VideoConferenceState,
  action: VideoConferenceAction
): VideoConferenceState {
  switch (action.type) {
    case 'SET_MEETING':
      return { ...state, currentMeeting: action.payload };
    
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.payload]
      };
    
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload)
      };
    
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    
    case 'SET_LOCAL_PARTICIPANT':
      return { ...state, localParticipant: action.payload };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload]
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'SET_JOINING_STATUS':
      return { ...state, isJoining: action.payload };
    
    case 'SET_MEDIA_DEVICES':
      return { ...state, mediaDevices: action.payload };
    
    case 'UPDATE_LOCAL_MEDIA_STATE':
      return {
        ...state,
        localMediaState: { ...state.localMediaState, ...action.payload }
      };
    
    case 'SET_SCREEN_SHARE_STREAM':
      return { ...state, screenShareStream: action.payload };
    
    case 'UPDATE_CONNECTION_QUALITY':
      return { ...state, connectionQuality: action.payload };
    
    case 'UPDATE_NETWORK_STATS':
      return { ...state, networkStats: action.payload };
    
    case 'ADD_SECURITY_EVENT':
      return {
        ...state,
        securityEvents: [...state.securityEvents, action.payload]
      };
    
    case 'SET_RECORDING_STATUS':
      return { ...state, isRecording: action.payload };
    
    case 'UPDATE_RECORDING_DURATION':
      return { ...state, recordingDuration: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface VideoConferenceContextType {
  state: VideoConferenceState;
  dispatch: React.Dispatch<VideoConferenceAction>;
  
  // Meeting Management
  joinMeeting: (meetingId: string, password: string) => Promise<boolean>;
  leaveMeeting: () => Promise<void>;
  createMeeting: (settings: any) => Promise<string>;
  
  // Media Controls
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  switchCamera: () => Promise<void>;
  setAudioDevice: (deviceId: string) => Promise<void>;
  setVideoDevice: (deviceId: string) => Promise<void>;
  
  // Chat
  sendChatMessage: (content: string, isPrivate?: boolean, recipientId?: string) => Promise<void>;
  
  // Recording
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  
  // Participant Management
  muteParticipant: (participantId: string) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  promoteToCoHost: (participantId: string) => Promise<void>;
  
  // Security
  lockMeeting: () => Promise<void>;
  unlockMeeting: () => Promise<void>;
  enableWaitingRoom: () => Promise<void>;
  disableWaitingRoom: () => Promise<void>;
}

const VideoConferenceContext = createContext<VideoConferenceContextType | undefined>(undefined);

export const VideoConferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(videoConferenceReducer, initialState);
  
  // Initialize services
  const webRTCService = new WebRTCService();
  const securityService = new SecurityService();
  const analyticsService = new AnalyticsService();

  useEffect(() => {
    // Initialize media devices
    initializeMediaDevices();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start network monitoring
    startNetworkMonitoring();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const deviceInfo: DeviceInfo[] = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput' | 'audiooutput' | 'videoinput',
        groupId: device.groupId
      }));
      
      dispatch({ type: 'SET_MEDIA_DEVICES', payload: deviceInfo });
    } catch (error) {
      console.error('Failed to enumerate media devices:', error);
    }
  };

  const setupEventListeners = () => {
    // WebRTC event listeners
    webRTCService.on('participantJoined', (participant: Participant) => {
      dispatch({ type: 'ADD_PARTICIPANT', payload: participant });
    });

    webRTCService.on('participantLeft', (participantId: string) => {
      dispatch({ type: 'REMOVE_PARTICIPANT', payload: participantId });
    });

    webRTCService.on('chatMessage', (message: ChatMessage) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
    });

    webRTCService.on('connectionQualityChanged', (quality: any) => {
      dispatch({ type: 'UPDATE_CONNECTION_QUALITY', payload: quality });
    });

    // Security event listeners
    securityService.on('securityEvent', (event: SecurityEvent) => {
      dispatch({ type: 'ADD_SECURITY_EVENT', payload: event });
    });
  };

  const startNetworkMonitoring = () => {
    setInterval(() => {
      const stats = webRTCService.getNetworkStats();
      dispatch({ type: 'UPDATE_NETWORK_STATS', payload: stats });
    }, 5000);
  };

  const cleanup = () => {
    webRTCService.disconnect();
    if (state.screenShareStream) {
      state.screenShareStream.getTracks().forEach(track => track.stop());
    }
  };

  // Meeting Management Functions
  const joinMeeting = async (meetingId: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_JOINING_STATUS', payload: true });
    
    try {
      // Validate meeting credentials
      const isValid = await securityService.validateMeetingAccess(meetingId, password);
      if (!isValid) {
        throw new Error('Invalid meeting credentials');
      }

      // Connect to meeting
      const success = await webRTCService.joinMeeting(meetingId, password);
      
      if (success) {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        analyticsService.trackMeetingJoin(meetingId);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to join meeting:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_JOINING_STATUS', payload: false });
    }
  };

  const leaveMeeting = async (): Promise<void> => {
    try {
      await webRTCService.leaveMeeting();
      dispatch({ type: 'RESET_STATE' });
      analyticsService.trackMeetingLeave(state.currentMeeting?.id || '');
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
  };

  const createMeeting = async (settings: any): Promise<string> => {
    try {
      const meetingId = await webRTCService.createMeeting(settings);
      analyticsService.trackMeetingCreate(meetingId);
      return meetingId;
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  };

  // Media Control Functions
  const toggleAudio = async (): Promise<void> => {
    try {
      const newState = await webRTCService.toggleAudio();
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { audioEnabled: newState } 
      });
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const toggleVideo = async (): Promise<void> => {
    try {
      const newState = await webRTCService.toggleVideo();
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { videoEnabled: newState } 
      });
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const startScreenShare = async (): Promise<void> => {
    try {
      const stream = await webRTCService.startScreenShare();
      dispatch({ type: 'SET_SCREEN_SHARE_STREAM', payload: stream });
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { screenShareEnabled: true } 
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  const stopScreenShare = async (): Promise<void> => {
    try {
      await webRTCService.stopScreenShare();
      if (state.screenShareStream) {
        state.screenShareStream.getTracks().forEach(track => track.stop());
      }
      dispatch({ type: 'SET_SCREEN_SHARE_STREAM', payload: null });
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { screenShareEnabled: false } 
      });
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  };

  const switchCamera = async (): Promise<void> => {
    try {
      await webRTCService.switchCamera();
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  const setAudioDevice = async (deviceId: string): Promise<void> => {
    try {
      await webRTCService.setAudioDevice(deviceId);
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { audioDevice: deviceId } 
      });
    } catch (error) {
      console.error('Failed to set audio device:', error);
    }
  };

  const setVideoDevice = async (deviceId: string): Promise<void> => {
    try {
      await webRTCService.setVideoDevice(deviceId);
      dispatch({ 
        type: 'UPDATE_LOCAL_MEDIA_STATE', 
        payload: { videoDevice: deviceId } 
      });
    } catch (error) {
      console.error('Failed to set video device:', error);
    }
  };

  // Chat Functions
  const sendChatMessage = async (
    content: string, 
    isPrivate: boolean = false, 
    recipientId?: string
  ): Promise<void> => {
    try {
      await webRTCService.sendChatMessage(content, isPrivate, recipientId);
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  };

  // Recording Functions
  const startRecording = async (): Promise<void> => {
    try {
      await webRTCService.startRecording();
      dispatch({ type: 'SET_RECORDING_STATUS', payload: true });
      
      // Start recording timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        dispatch({ type: 'UPDATE_RECORDING_DURATION', payload: duration });
      }, 1000);
      
      // Store timer reference for cleanup
      (window as any).recordingTimer = timer;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async (): Promise<void> => {
    try {
      await webRTCService.stopRecording();
      dispatch({ type: 'SET_RECORDING_STATUS', payload: false });
      dispatch({ type: 'UPDATE_RECORDING_DURATION', payload: 0 });
      
      // Clear recording timer
      if ((window as any).recordingTimer) {
        clearInterval((window as any).recordingTimer);
        (window as any).recordingTimer = null;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Participant Management Functions
  const muteParticipant = async (participantId: string): Promise<void> => {
    try {
      await webRTCService.muteParticipant(participantId);
    } catch (error) {
      console.error('Failed to mute participant:', error);
    }
  };

  const removeParticipant = async (participantId: string): Promise<void> => {
    try {
      await webRTCService.removeParticipant(participantId);
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  const promoteToCoHost = async (participantId: string): Promise<void> => {
    try {
      await webRTCService.promoteToCoHost(participantId);
    } catch (error) {
      console.error('Failed to promote participant:', error);
    }
  };

  // Security Functions
  const lockMeeting = async (): Promise<void> => {
    try {
      await webRTCService.lockMeeting();
    } catch (error) {
      console.error('Failed to lock meeting:', error);
    }
  };

  const unlockMeeting = async (): Promise<void> => {
    try {
      await webRTCService.unlockMeeting();
    } catch (error) {
      console.error('Failed to unlock meeting:', error);
    }
  };

  const enableWaitingRoom = async (): Promise<void> => {
    try {
      await webRTCService.enableWaitingRoom();
    } catch (error) {
      console.error('Failed to enable waiting room:', error);
    }
  };

  const disableWaitingRoom = async (): Promise<void> => {
    try {
      await webRTCService.disableWaitingRoom();
    } catch (error) {
      console.error('Failed to disable waiting room:', error);
    }
  };

  const contextValue: VideoConferenceContextType = {
    state,
    dispatch,
    joinMeeting,
    leaveMeeting,
    createMeeting,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    setAudioDevice,
    setVideoDevice,
    sendChatMessage,
    startRecording,
    stopRecording,
    muteParticipant,
    removeParticipant,
    promoteToCoHost,
    lockMeeting,
    unlockMeeting,
    enableWaitingRoom,
    disableWaitingRoom
  };

  return (
    <VideoConferenceContext.Provider value={contextValue}>
      {children}
    </VideoConferenceContext.Provider>
  );
};

export const useVideoConference = (): VideoConferenceContextType => {
  const context = useContext(VideoConferenceContext);
  if (!context) {
    throw new Error('useVideoConference must be used within a VideoConferenceProvider');
  }
  return context;
};
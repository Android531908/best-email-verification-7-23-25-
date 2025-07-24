// Core Types for Video Conferencing Platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  institution?: string;
  verified: boolean;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'guest';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  password: string;
  maxParticipants: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  isRecording: boolean;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  settings: MeetingSettings;
  createdAt: Date;
  status: 'scheduled' | 'active' | 'ended';
}

export interface MeetingSettings {
  allowScreenShare: boolean;
  allowChat: boolean;
  allowBreakoutRooms: boolean;
  allowWhiteboard: boolean;
  allowRecording: boolean;
  muteOnEntry: boolean;
  videoOnEntry: boolean;
  requirePassword: boolean;
  domainRestriction?: string[];
  maxVideoQuality: VideoQuality;
  enableE2EE: boolean;
}

export type VideoQuality = '360p' | '720p' | '1080p';

export interface Participant {
  id: string;
  user: User;
  joinedAt: Date;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  mediaState: MediaState;
  connectionQuality: ConnectionQuality;
  isInBreakoutRoom?: string;
}

export type ParticipantRole = 'host' | 'co-host' | 'participant' | 'observer';

export interface ParticipantPermissions {
  canSpeak: boolean;
  canVideo: boolean;
  canScreenShare: boolean;
  canChat: boolean;
  canAnnotate: boolean;
  canManageParticipants: boolean;
  canRecord: boolean;
}

export interface MediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  audioDevice?: string;
  videoDevice?: string;
  audioLevel: number;
  videoQuality: VideoQuality;
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'code' | 'system';
  isPrivate: boolean;
  recipientId?: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  maxParticipants: number;
  isOpen: boolean;
  createdAt: Date;
}

export interface WhiteboardState {
  id: string;
  elements: WhiteboardElement[];
  version: number;
  lastModified: Date;
  collaborators: string[];
}

export interface WhiteboardElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'equation' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  content?: string;
  points?: Point[];
  createdBy: string;
  createdAt: Date;
}

export interface Point {
  x: number;
  y: number;
}

export interface RecordingSession {
  id: string;
  meetingId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileSize?: number;
  url?: string;
  transcription?: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  settings: RecordingSettings;
}

export interface RecordingSettings {
  includeAudio: boolean;
  includeVideo: boolean;
  includeScreenShare: boolean;
  includeChat: boolean;
  quality: VideoQuality;
  format: 'mp4' | 'webm';
  enableTranscription: boolean;
}

export interface AnalyticsData {
  meetingId: string;
  duration: number;
  participantCount: number;
  peakParticipants: number;
  averageConnectionQuality: ConnectionQuality;
  totalChatMessages: number;
  screenShareDuration: number;
  recordingDuration: number;
  networkStats: NetworkStats;
}

export interface NetworkStats {
  averageLatency: number;
  packetLoss: number;
  jitter: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}

export interface SecurityEvent {
  id: string;
  meetingId: string;
  type: 'unauthorized_access' | 'suspicious_activity' | 'policy_violation' | 'security_breach';
  description: string;
  userId?: string;
  ipAddress: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  maxBitrate: number;
  videoCodec: 'VP8' | 'VP9' | 'H264';
  audioCodec: 'OPUS' | 'G722';
  enableDTLS: boolean;
  enableSRTP: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  groupId: string;
}

export interface MediaConstraints {
  video: {
    width: { min: number; ideal: number; max: number };
    height: { min: number; ideal: number; max: number };
    frameRate: { min: number; ideal: number; max: number };
    facingMode?: 'user' | 'environment';
  };
  audio: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    sampleRate: number;
    channelCount: number;
  };
}
import { EventEmitter } from '../../../utils/EventEmitter';
import { 
  WebRTCConfig, 
  MediaConstraints, 
  Participant, 
  ChatMessage,
  VideoQuality 
} from '../types/conference.types';

export class WebRTCService extends EventEmitter {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenShareStream: MediaStream | null = null;
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private meetingId: string | null = null;
  private isHost: boolean = false;
  private websocket: WebSocket | null = null;
  
  private readonly config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { 
        urls: 'turn:your-turn-server.com:3478',
        username: 'your-username',
        credential: 'your-password'
      }
    ],
    maxBitrate: 2500000, // 2.5 Mbps
    videoCodec: 'VP9',
    audioCodec: 'OPUS',
    enableDTLS: true,
    enableSRTP: true
  };

  private readonly mediaConstraints: MediaConstraints = {
    video: {
      width: { min: 640, ideal: 1920, max: 1920 },
      height: { min: 480, ideal: 1080, max: 1080 },
      frameRate: { min: 15, ideal: 30, max: 60 },
      facingMode: 'user'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 2
    }
  };

  constructor() {
    super();
    // Use mock signaling in development to avoid WebSocket connection errors
    if (process.env.NODE_ENV === 'production') {
      this.setupWebSocket();
    } else {
      this.setupMockSignaling();
    }
  }

  private setupWebSocket(): void {
    // In production, this would connect to your signaling server
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://your-signaling-server.com/ws'
      : 'ws://localhost:8080/ws';
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected to signaling server');
      };
      
      this.websocket.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(() => this.setupWebSocket(), 3000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      // Fallback to mock signaling for demo
      this.setupMockSignaling();
    }
  }

  private setupMockSignaling(): void {
    // Mock signaling for demo purposes
    console.log('Using mock signaling server for demo');
  }

  private handleSignalingMessage(message: any): void {
    switch (message.type) {
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message);
        break;
      case 'participant-joined':
        this.emit('participantJoined', message.participant);
        break;
      case 'participant-left':
        this.emit('participantLeft', message.participantId);
        break;
      case 'chat-message':
        this.emit('chatMessage', message.message);
        break;
      default:
        console.log('Unknown signaling message:', message);
    }
  }

  async joinMeeting(meetingId: string, password: string): Promise<boolean> {
    try {
      this.meetingId = meetingId;
      
      // Get user media
      await this.initializeLocalMedia();
      
      // Send join request to signaling server
      this.sendSignalingMessage({
        type: 'join-meeting',
        meetingId,
        password,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to join meeting:', error);
      return false;
    }
  }

  async leaveMeeting(): Promise<void> {
    try {
      // Close all peer connections
      this.peerConnections.forEach(pc => pc.close());
      this.peerConnections.clear();
      
      // Stop local media
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Stop screen share
      if (this.screenShareStream) {
        this.screenShareStream.getTracks().forEach(track => track.stop());
        this.screenShareStream = null;
      }
      
      // Send leave message
      this.sendSignalingMessage({
        type: 'leave-meeting',
        meetingId: this.meetingId,
        timestamp: Date.now()
      });
      
      this.meetingId = null;
      this.isHost = false;
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
  }

  async createMeeting(settings: any): Promise<string> {
    const meetingId = this.generateMeetingId();
    this.meetingId = meetingId;
    this.isHost = true;
    
    // Initialize local media
    await this.initializeLocalMedia();
    
    // Send create meeting request
    this.sendSignalingMessage({
      type: 'create-meeting',
      meetingId,
      settings,
      timestamp: Date.now()
    });
    
    return meetingId;
  }

  private async initializeLocalMedia(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.mediaConstraints.video,
        audio: this.mediaConstraints.audio
      });
      
      console.log('Local media initialized successfully');
    } catch (error) {
      console.error('Failed to initialize local media:', error);
      throw error;
    }
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      
      // Notify other participants
      this.sendSignalingMessage({
        type: 'media-state-change',
        mediaType: 'audio',
        enabled: audioTrack.enabled,
        timestamp: Date.now()
      });
      
      return audioTrack.enabled;
    }
    
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      
      // Notify other participants
      this.sendSignalingMessage({
        type: 'media-state-change',
        mediaType: 'video',
        enabled: videoTrack.enabled,
        timestamp: Date.now()
      });
      
      return videoTrack.enabled;
    }
    
    return false;
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 }
        },
        audio: true
      });
      
      // Replace video track in all peer connections
      const videoTrack = this.screenShareStream.getVideoTracks()[0];
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      
      // Notify other participants
      this.sendSignalingMessage({
        type: 'screen-share-started',
        timestamp: Date.now()
      });
      
      return this.screenShareStream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.screenShareStream) return;
    
    try {
      // Stop screen share tracks
      this.screenShareStream.getTracks().forEach(track => track.stop());
      
      // Replace with camera video
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        this.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        });
      }
      
      this.screenShareStream = null;
      
      // Notify other participants
      this.sendSignalingMessage({
        type: 'screen-share-stopped',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;
    
    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      // Get new video stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...this.mediaConstraints.video,
          facingMode: newFacingMode
        },
        audio: false
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      });
      
      // Stop old video track and replace in local stream
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  }

  async setAudioDevice(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...this.mediaConstraints.audio,
          deviceId: { exact: deviceId }
        },
        video: false
      });
      
      const newAudioTrack = newStream.getAudioTracks()[0];
      
      if (this.localStream) {
        const oldAudioTrack = this.localStream.getAudioTracks()[0];
        
        // Replace audio track in all peer connections
        this.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'audio'
          );
          if (sender) {
            await sender.replaceTrack(newAudioTrack);
          }
        });
        
        // Replace in local stream
        if (oldAudioTrack) {
          oldAudioTrack.stop();
          this.localStream.removeTrack(oldAudioTrack);
        }
        this.localStream.addTrack(newAudioTrack);
      }
    } catch (error) {
      console.error('Failed to set audio device:', error);
    }
  }

  async setVideoDevice(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...this.mediaConstraints.video,
          deviceId: { exact: deviceId }
        },
        audio: false
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      if (this.localStream) {
        const oldVideoTrack = this.localStream.getVideoTracks()[0];
        
        // Replace video track in all peer connections
        this.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        });
        
        // Replace in local stream
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          this.localStream.removeTrack(oldVideoTrack);
        }
        this.localStream.addTrack(newVideoTrack);
      }
    } catch (error) {
      console.error('Failed to set video device:', error);
    }
  }

  async sendChatMessage(content: string, isPrivate: boolean = false, recipientId?: string): Promise<void> {
    const message: ChatMessage = {
      id: this.generateId(),
      senderId: 'current-user-id', // This would come from auth context
      senderName: 'Current User', // This would come from auth context
      content,
      timestamp: new Date(),
      type: 'text',
      isPrivate,
      recipientId
    };
    
    this.sendSignalingMessage({
      type: 'chat-message',
      message,
      timestamp: Date.now()
    });
  }

  async startRecording(): Promise<void> {
    this.sendSignalingMessage({
      type: 'start-recording',
      timestamp: Date.now()
    });
  }

  async stopRecording(): Promise<void> {
    this.sendSignalingMessage({
      type: 'stop-recording',
      timestamp: Date.now()
    });
  }

  async muteParticipant(participantId: string): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can mute participants');
    }
    
    this.sendSignalingMessage({
      type: 'mute-participant',
      participantId,
      timestamp: Date.now()
    });
  }

  async removeParticipant(participantId: string): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can remove participants');
    }
    
    this.sendSignalingMessage({
      type: 'remove-participant',
      participantId,
      timestamp: Date.now()
    });
  }

  async promoteToCoHost(participantId: string): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can promote participants');
    }
    
    this.sendSignalingMessage({
      type: 'promote-participant',
      participantId,
      role: 'co-host',
      timestamp: Date.now()
    });
  }

  async lockMeeting(): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can lock meetings');
    }
    
    this.sendSignalingMessage({
      type: 'lock-meeting',
      timestamp: Date.now()
    });
  }

  async unlockMeeting(): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can unlock meetings');
    }
    
    this.sendSignalingMessage({
      type: 'unlock-meeting',
      timestamp: Date.now()
    });
  }

  async enableWaitingRoom(): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can enable waiting room');
    }
    
    this.sendSignalingMessage({
      type: 'enable-waiting-room',
      timestamp: Date.now()
    });
  }

  async disableWaitingRoom(): Promise<void> {
    if (!this.isHost) {
      throw new Error('Only hosts can disable waiting room');
    }
    
    this.sendSignalingMessage({
      type: 'disable-waiting-room',
      timestamp: Date.now()
    });
  }

  getNetworkStats(): any {
    // This would return actual network statistics in a real implementation
    return {
      latency: Math.random() * 100 + 50, // 50-150ms
      packetLoss: Math.random() * 0.01, // 0-1%
      bandwidth: {
        upload: Math.random() * 1000 + 1500, // 1.5-2.5 Mbps
        download: Math.random() * 1000 + 1500
      }
    };
  }

  disconnect(): void {
    this.leaveMeeting();
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection({
      iceServers: this.config.iceServers,
      iceCandidatePoolSize: 10
    });
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetId: participantId,
          timestamp: Date.now()
        });
      }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      this.emit('remoteTrack', {
        participantId,
        track: event.track,
        stream: event.streams[0]
      });
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, pc.connectionState);
      if (pc.connectionState === 'failed') {
        this.handleConnectionFailure(participantId);
      }
    };
    
    this.peerConnections.set(participantId, pc);
    return pc;
  }

  private async handleOffer(message: any): Promise<void> {
    const pc = await this.createPeerConnection(message.senderId);
    
    await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.sendSignalingMessage({
      type: 'answer',
      answer,
      targetId: message.senderId,
      timestamp: Date.now()
    });
  }

  private async handleAnswer(message: any): Promise<void> {
    const pc = this.peerConnections.get(message.senderId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
    }
  }

  private async handleIceCandidate(message: any): Promise<void> {
    const pc = this.peerConnections.get(message.senderId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }

  private handleConnectionFailure(participantId: string): void {
    console.log(`Connection failed for participant ${participantId}, attempting to reconnect...`);
    // Implement reconnection logic
  }

  private sendSignalingMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 14).toUpperCase();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getScreenShareStream(): MediaStream | null {
    return this.screenShareStream;
  }

  getPeerConnections(): Map<string, RTCPeerConnection> {
    return this.peerConnections;
  }
}
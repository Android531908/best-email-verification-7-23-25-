import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  ArrowLeft,
  Users,
  Clock
} from 'lucide-react';
import { User } from '../types/conference.types';

interface MeetingLobbyProps {
  meetingId: string;
  isHost: boolean;
  user: User;
  onEnterConference: () => void;
  onExit: () => void;
}

const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  meetingId,
  isHost,
  user,
  onEnterConference,
  onExit
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [waitingParticipants] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeDevices();
    startPreview();
    
    return () => {
      stopPreview();
    };
  }, []);

  useEffect(() => {
    if (selectedVideoDevice || selectedAudioDevice) {
      restartPreview();
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  const initializeDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  const startPreview = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice 
          ? { deviceId: { exact: selectedVideoDevice } }
          : true,
        audio: selectedAudioDevice 
          ? { deviceId: { exact: selectedAudioDevice } }
          : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Apply initial mute/video states
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
      
    } catch (error) {
      console.error('Error starting preview:', error);
    }
  };

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const restartPreview = () => {
    stopPreview();
    startPreview();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
  };

  const handleJoinMeeting = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onEnterConference();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl border border-amber-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onExit}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-amber-700" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-amber-900">Ready to join?</h2>
              <p className="text-amber-700">Session ID: {meetingId}</p>
            </div>
          </div>
          
          {isHost && waitingParticipants > 0 && (
            <div className="flex items-center space-x-2 bg-amber-500 bg-opacity-50 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white text-sm">
                {waitingParticipants} waiting
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border-4 border-amber-200 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {isVideoOff && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-semibold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                    isMuted 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                    isVideoOff 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full transition-all duration-200 shadow-lg"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Join as</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg font-semibold text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-amber-900 font-medium">{user.name}</p>
                  <p className="text-amber-700 text-sm">{user.email}</p>
                  {isHost && (
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs text-white rounded-full mt-1">
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>

            {showSettings && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Device Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-700 text-sm font-medium mb-2">
                      Camera
                    </label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {videoDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-amber-700 text-sm font-medium mb-2">
                      Microphone
                    </label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {audioDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleJoinMeeting}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  'Join Learning Session'
                )}
              </button>
              
              <button
                onClick={onExit}
                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold py-3 px-4 rounded-lg transition-colors border border-amber-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingLobby;
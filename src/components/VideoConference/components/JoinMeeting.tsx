import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  BookOpen
} from 'lucide-react';
import { User } from '../types/conference.types';

interface JoinMeetingProps {
  onJoin: (meetingId: string, password: string) => void;
  onCreateNew: () => void;
  onAdminPanel: () => void;
  user: User;
}

const JoinMeeting: React.FC<JoinMeetingProps> = ({ onJoin, onCreateNew, onAdminPanel, user }) => {
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false,
    checking: true
  });
  const [deviceError, setDeviceError] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([
    { id: 'DEMO123456', title: 'Demo Meeting', lastJoined: '2 hours ago' },
    { id: 'TEST789012', title: 'Test Session', lastJoined: '1 day ago' },
    { id: 'MEET345678', title: 'Study Group', lastJoined: '3 days ago' }
  ]);

  useEffect(() => {
    checkDevicePermissions();
  }, []);

  const checkDevicePermissions = async () => {
    try {
      setDeviceError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setDevicePermissions({
        camera: true,
        microphone: true,
        checking: false
      });
      
      // Stop the stream after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Device permission check failed:', error);
      
      let errorMessage = 'Unable to access camera or microphone. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera and microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera or microphone found. Please check your device connections.';
        } else if (error.name === 'NotReadableError' || error.message.includes('videosource')) {
          errorMessage += 'Camera is being used by another application. Please close other video apps and refresh the page.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera or microphone constraints cannot be satisfied by your device.';
        } else {
          errorMessage += 'Please check your device connections and browser permissions.';
        }
      }
      
      setDeviceError(errorMessage);
      setDevicePermissions({
        camera: false,
        microphone: false,
        checking: false
      });
    }
  };

  const handleJoin = async () => {
    if (!meetingId.trim()) {
      setError('Please enter a meeting ID');
      return;
    }

    if (!password.trim()) {
      setError('Please enter the meeting password');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (meetingId.length < 8) {
        throw new Error('Meeting ID must be at least 8 characters');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      onJoin(meetingId.toUpperCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
    } finally {
      setIsJoining(false);
    }
  };

  const handleQuickJoin = (meeting: any) => {
    setMeetingId(meeting.id);
    // For demo, use a default password
    setPassword('password123');
  };

  const formatMeetingId = (value: string) => {
    // Format as XXX-XXX-XXX
    const cleaned = value.replace(/\D/g, '').substring(0, 12);
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Join Meeting */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-amber-200 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Join Learning Session</h1>
            <p className="text-amber-700">Enter your session details to get started</p>
          </div>

          {/* Device Status */}
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="text-amber-900 font-semibold mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Device Status
            </h3>
            
            {/* Device Error Message */}
            {deviceError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-red-200 text-sm">
                    <p className="font-medium mb-1">Device Access Failed</p>
                    <p>{deviceError}</p>
                    <button
                      onClick={checkDevicePermissions}
                      className="mt-2 text-red-300 hover:text-red-100 underline text-xs"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {devicePermissions.checking ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : devicePermissions.camera ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-blue-200">Camera</span>
              </div>
              <div className="flex items-center space-x-2">
                {devicePermissions.checking ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : devicePermissions.microphone ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-blue-200">Microphone</span>
              </div>
            </div>
          </div>

          {/* Meeting Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Session ID
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
                placeholder="Enter session ID"
                className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                maxLength={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Session Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter session password"
                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex space-x-4">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 shadow-md ${
                  audioEnabled 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
                disabled={!devicePermissions.microphone}
              >
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {audioEnabled ? 'Mic On' : 'Mic Off'}
                </span>
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 shadow-md ${
                  videoEnabled 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
                disabled={!devicePermissions.camera}
              >
                {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {videoEnabled ? 'Video On' : 'Video Off'}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={isJoining || !devicePermissions.camera || !devicePermissions.microphone}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            {isJoining ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Joining Session...</span>
              </div>
            ) : (
              'Join Learning Session'
            )}
          </button>

          {/* Alternative Actions */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onCreateNew}
              className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium py-3 px-4 rounded-xl transition-colors border border-amber-200"
            >
              Create New Session
            </button>
            {user.role === 'admin' && (
              <button
                onClick={onAdminPanel}
                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium py-3 px-4 rounded-xl transition-colors border border-amber-200"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Recent Meetings & Info */}
        <div className="space-y-6">
          {/* Recent Meetings */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-amber-200 shadow-xl">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {recentMeetings.map((meeting, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickJoin(meeting)}
                  className="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-amber-900 font-medium">{meeting.title}</h4>
                      <p className="text-amber-700 text-sm">ID: {meeting.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-600 text-sm">{meeting.lastJoined}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-amber-200 shadow-xl">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              System Requirements
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Browser</span>
                <span className="text-amber-900">Chrome 88+, Firefox 85+, Safari 14+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Bandwidth</span>
                <span className="text-amber-900">1.5 Mbps up/down minimum</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Resolution</span>
                <span className="text-amber-900">Up to 1080p HD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Participants</span>
                <span className="text-amber-900">Up to 50 concurrent users</span>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-amber-200 shadow-xl">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Features
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-amber-700">End-to-end encryption (AES-256)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-amber-700">Waiting room protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-amber-700">Host-controlled access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-amber-700">Session watermarking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-amber-700">GDPR & FERPA compliant</span>
              </div>
            </div>
          </div>

          {/* Mobile App Promotion */}
          <div className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-300">
            <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Curio Tutors Mobile App
            </h3>
            <p className="text-amber-700 text-sm mb-4">
              Get the best learning experience with our mobile app for iOS and Android
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                App Store
              </button>
              <button className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                Google Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;
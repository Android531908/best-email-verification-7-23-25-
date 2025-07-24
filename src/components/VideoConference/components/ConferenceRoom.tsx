import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Users, 
  Settings,
  MessageSquare,
  MoreVertical,
  Edit3,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Grid3X3,
  User,
  Clock,
  Wifi,
  Signal,
  Battery,
  Shield,
  Award,
  BookOpen
} from 'lucide-react';
import { User as UserType } from '../types/conference.types';
import Whiteboard from './Whiteboard';

interface ConferenceRoomProps {
  meetingId: string;
  isHost: boolean;
  user: UserType;
  onExit: () => void;
}

const ConferenceRoom: React.FC<ConferenceRoomProps> = ({ 
  meetingId, 
  isHost, 
  user, 
  onExit 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [meetingDuration, setMeetingDuration] = useState('00:00');
  const [participants] = useState([user]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Dr. Smith', message: 'Welcome to today\'s session!', time: '2:00 PM', isOwn: false },
    { id: 2, sender: 'You', message: 'Thank you! Ready to learn.', time: '2:01 PM', isOwn: true }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeLocalVideo();
    startMeetingTimer();
    
    return () => {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const startMeetingTimer = () => {
    const startTime = Date.now();
    setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setMeetingDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
      }
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initializeLocalVideo();
        };
      } else {
        setIsScreenSharing(false);
        initializeLocalVideo();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Signal className="h-4 w-4 text-green-400" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-amber-400" />;
      case 'fair':
        return <Wifi className="h-4 w-4 text-orange-400" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-amber-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Curio Tutors Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-900">Curio Tutors</h1>
                <p className="text-xs text-amber-700">Where Learning Comes to Life</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-amber-300"></div>
            
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-semibold text-amber-900">Advanced Mathematics</h2>
                <div className="flex items-center space-x-4 text-sm text-amber-700">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{meetingDuration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getConnectionIcon()}
                    <span className="capitalize">{connectionQuality}</span>
                  </div>
                </div>
              </div>
              {isHost && (
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-medium rounded-full shadow-md">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Host</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showParticipants 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                showChat 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setShowWhiteboard(true)}
              className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all duration-200"
              title="Open Whiteboard"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all duration-200">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-tl-3xl">
          {/* Remote Video (Main) */}
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover rounded-tl-3xl"
            autoPlay
            playsInline
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-6 right-6 w-64 h-48 bg-gray-800 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
                </div>
              </div>
            )}
            
            {/* Local Video Controls */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
              }`}>
                {isMuted ? 'Muted' : 'Live'}
              </div>
            </div>
          </div>

          {/* Meeting Info Overlay */}
          <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="text-white">
                <p className="text-sm font-medium">Recording</p>
                <p className="text-xs opacity-75">Meeting ID: {meetingId}</p>
              </div>
            </div>
          </div>

          {/* Screen Share Indicator */}
          {isScreenSharing && (
            <div className="absolute bottom-6 left-6 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span className="text-sm font-medium">You're sharing your screen</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-amber-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-amber-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowParticipants(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    showParticipants 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Participants ({participants.length})
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    showChat 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>

            {showParticipants && (
              <div className="flex-1 p-4">
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-amber-900">{participant.name}</span>
                          {participant.id === user.id && (
                            <span className="text-xs text-amber-600 block">(You)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <button className="p-1 hover:bg-amber-200 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showChat && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-2xl ${
                          message.isOwn 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                            : 'bg-amber-50 border border-amber-200 text-amber-900'
                        }`}>
                          <div className="text-xs opacity-75 mb-1">{message.sender} • {message.time}</div>
                          <div className="text-sm">{message.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-amber-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-white/95 backdrop-blur-sm border-t border-amber-200">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg ${
              isMuted 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg ${
              isVideoOff 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg ${
              isScreenSharing 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
            }`}
          >
            <Monitor className="w-6 h-6" />
          </button>
          
          <div className="w-px h-12 bg-amber-300"></div>
          
          <button
            onClick={onExit}
            className="p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-200 shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
        
        {/* Secondary Controls */}
        <div className="flex items-center justify-center space-x-3 mt-4">
          <button className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Whiteboard */}
      <Whiteboard
        isVisible={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
        participants={[
          { id: user.id, name: user.name, color: '#F59E0B' },
          { id: 'participant-2', name: 'Dr. Smith', color: '#EF4444' },
          { id: 'participant-3', name: 'Student B', color: '#10B981' }
        ]}
        currentUser={{ id: user.id, name: user.name }}
      />
    </div>
  );
};

export default ConferenceRoom;
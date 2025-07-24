import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Bell, 
  Download, 
  Copy, 
  ExternalLink,
  Smartphone,
  Monitor,
  Headphones,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  Settings,
  Share2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import VideoConferenceApp from './VideoConference/VideoConferenceApp';

interface ConferenceSession {
  id: string;
  time: string;
  subject: string;
  instructor: string;
  duration: string;
  location: string;
  type: 'class' | 'lab' | 'study' | 'homework' | 'break';
  hasVideoConference: boolean;
  meetingId?: string;
  meetingPassword?: string;
  description?: string;
  timezone: string;
  startDateTime: Date;
  endDateTime: Date;
}

interface VideoConferenceScheduleProps {
  onBack: () => void;
  userData: { firstName: string } | null;
}

const VideoConferenceSchedule: React.FC<VideoConferenceScheduleProps> = ({ onBack, userData }) => {
  const [selectedSession, setSelectedSession] = useState<ConferenceSession | null>(null);
  const [showVideoConference, setShowVideoConference] = useState(false);
  const [userTimezone, setUserTimezone] = useState('');
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [systemRequirements, setSystemRequirements] = useState({
    browser: false,
    camera: false,
    microphone: false,
    bandwidth: false,
    checking: true
  });

  // Auto-detect user timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  // Check system requirements
  useEffect(() => {
    checkSystemRequirements();
  }, []);

  const videoConferenceSessions: ConferenceSession[] = [
    {
      id: '1',
      time: '9:00 AM',
      subject: 'Advanced Mathematics',
      instructor: 'Dr. Smith',
      duration: '1h 30m',
      location: 'Virtual Classroom A',
      type: 'class',
      hasVideoConference: true,
      meetingId: 'MATH901234',
      meetingPassword: 'math2024',
      description: 'Advanced Calculus - Derivatives and Applications',
      timezone: userTimezone,
      startDateTime: new Date(2024, 9, 24, 9, 0),
      endDateTime: new Date(2024, 9, 24, 10, 30)
    },
    {
      id: '2',
      time: '2:00 PM',
      subject: 'Physics Laboratory',
      instructor: 'Prof. Wilson',
      duration: '2h',
      location: 'Virtual Lab 205',
      type: 'lab',
      hasVideoConference: true,
      meetingId: 'PHYS140567',
      meetingPassword: 'physics2024',
      description: 'Quantum Mechanics Laboratory Session',
      timezone: userTimezone,
      startDateTime: new Date(2024, 9, 24, 14, 0),
      endDateTime: new Date(2024, 9, 24, 16, 0)
    },
    {
      id: '3',
      time: '5:00 PM',
      subject: 'History Study Group',
      instructor: 'Ms. Johnson',
      duration: '1h',
      location: 'Virtual Study Room A',
      type: 'study',
      hasVideoConference: true,
      meetingId: 'HIST789012',
      meetingPassword: 'history2024',
      description: 'World War II Discussion and Analysis',
      timezone: userTimezone,
      startDateTime: new Date(2024, 9, 24, 17, 0),
      endDateTime: new Date(2024, 9, 24, 18, 0)
    },
    {
      id: '4',
      time: '7:00 PM',
      subject: 'English Essay Workshop',
      instructor: 'Mrs. Davis',
      duration: '2h',
      location: 'Virtual Writing Center',
      type: 'homework',
      hasVideoConference: true,
      meetingId: 'ENG345678',
      meetingPassword: 'english2024',
      description: 'Literary Analysis Workshop',
      timezone: userTimezone,
      startDateTime: new Date(2024, 9, 24, 19, 0),
      endDateTime: new Date(2024, 9, 24, 21, 0)
    }
  ];

  const checkSystemRequirements = async () => {
    setSystemRequirements(prev => ({ ...prev, checking: true }));

    // Check browser compatibility
    const browserCheck = checkBrowserCompatibility();
    
    // Check media devices
    let cameraCheck = false;
    let microphoneCheck = false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraCheck = true;
      microphoneCheck = true;
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Media device check failed:', error);
    }

    // Check bandwidth (mock)
    const bandwidthCheck = await checkBandwidth();

    setSystemRequirements({
      browser: browserCheck,
      camera: cameraCheck,
      microphone: microphoneCheck,
      bandwidth: bandwidthCheck,
      checking: false
    });
  };

  const checkBrowserCompatibility = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isEdge = userAgent.includes('edg');
    
    return isChrome || isFirefox || isSafari || isEdge;
  };

  const checkBandwidth = async (): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(Math.random() > 0.1), 1000);
    });
  };

  const formatTimeInTimezone = (date: Date, timezone: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const generateCalendarEvent = (session: ConferenceSession) => {
    const startTime = session.startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = session.endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const eventDetails = {
      title: `${session.subject} - ${session.instructor}`,
      description: `${session.description || session.subject}\n\nVideo Conference Details:\nMeeting ID: ${session.meetingId}\nPassword: ${session.meetingPassword}\n\nJoin URL: ${window.location.origin}/video-conference?meeting=${session.meetingId}\n\nSystem Requirements:\n- Chrome 88+, Firefox 85+, Safari 14+\n- 1.5 Mbps bandwidth\n- Camera and microphone access\n\nSupport: support@curiotutors.com`,
      location: session.hasVideoConference ? 'Video Conference' : session.location,
      startTime,
      endTime
    };

    return eventDetails;
  };

  const downloadICSFile = (session: ConferenceSession) => {
    const event = generateCalendarEvent(session);
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Curio Tutors//Video Conference//EN
BEGIN:VEVENT
UID:${session.id}@curiotutors.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.startTime}
DTEND:${event.endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title} starts in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.subject.replace(/\s+/g, '_')}_${session.startDateTime.toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addToGoogleCalendar = (session: ConferenceSession) => {
    const event = generateCalendarEvent(session);
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startTime}/${event.endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    window.open(googleUrl, '_blank');
  };

  const addToOutlookCalendar = (session: ConferenceSession) => {
    const event = generateCalendarEvent(session);
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.startTime}&enddt=${event.endTime}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    window.open(outlookUrl, '_blank');
  };

  const copyMeetingDetails = (session: ConferenceSession) => {
    const details = `${session.subject} - Video Conference

Meeting ID: ${session.meetingId}
Password: ${session.meetingPassword}
Time: ${session.time} (${session.duration})
Instructor: ${session.instructor}

Join URL: ${window.location.origin}/video-conference?meeting=${session.meetingId}

System Requirements:
- Chrome 88+, Firefox 85+, Safari 14+
- 1.5 Mbps bandwidth minimum
- Camera and microphone access

Support: support@curiotutors.com
Phone: +1 (555) 123-4567`;

    navigator.clipboard.writeText(details).then(() => {
      alert('Meeting details copied to clipboard!');
    });
  };

  const joinVideoConference = (session: ConferenceSession) => {
    // Create video conference URL with session data
    const conferenceUrl = `/video-conference?meetingId=${session.meetingId}&password=${session.meetingPassword}&subject=${encodeURIComponent(session.subject)}&instructor=${encodeURIComponent(session.instructor)}`;
    
    // Open in new tab/window
    const newWindow = window.open(conferenceUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // Focus the new window if it opened successfully
    if (newWindow) {
      newWindow.focus();
    } else {
      // Fallback if popup was blocked
      alert('Please allow popups for this site to open video conferences in new tabs. You can also manually open the conference by copying the meeting link.');
    }
  };

  const openVideoConferenceInNewTab = (session: ConferenceSession) => {
    joinVideoConference(session);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-amber-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Video Conferences</h1>
              <p className="text-amber-700">Today - October 24, 2024 ({userTimezone})</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSystemCheck(true)}
              className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              title="Check System Requirements"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conference Sessions */}
      <div className="p-6 space-y-4">
        {videoConferenceSessions.map((session) => (
          <div key={session.id} className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-amber-900 font-bold text-xl">{session.time}</div>
                  <div className="text-amber-700 text-sm">{session.duration}</div>
                </div>
                <div className={`w-1 h-16 rounded-full ${
                  session.type === 'class' ? 'bg-blue-500' :
                  session.type === 'lab' ? 'bg-emerald-500' :
                  session.type === 'study' ? 'bg-amber-500' :
                  session.type === 'homework' ? 'bg-orange-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-amber-900">{session.subject}</h3>
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2 text-amber-700 mb-1">
                    <User className="h-4 w-4" />
                    <span>{session.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-700 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                  {session.description && (
                    <p className="text-amber-600 mb-2">{session.description}</p>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      session.type === 'class' ? 'bg-blue-100 text-blue-800' :
                      session.type === 'lab' ? 'bg-emerald-100 text-emerald-800' :
                      session.type === 'study' ? 'bg-amber-100 text-amber-800' :
                      session.type === 'homework' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.type}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-amber-700">
                      <Globe className="h-3 w-3" />
                      <span>Meeting ID: {session.meetingId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  className="p-2 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors"
                  title="Set Reminder"
                >
                  <Bell className="h-4 w-4 text-amber-700" />
                </button>
                
                <button
                  onClick={() => setSelectedSession(session)}
                  className="p-2 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors"
                  title="Meeting Details"
                >
                  <ExternalLink className="h-4 w-4 text-blue-700" />
                </button>
                
                <button
                  onClick={() => openVideoConferenceInNewTab(session)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold"
                >
                  Open Conference
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Details Modal */}
      {selectedSession && !showVideoConference && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Video Conference Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Session Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Video className="h-6 w-6 text-blue-600" />
                <h4 className="text-xl font-bold text-gray-900">{selectedSession.subject}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span>{selectedSession.time} ({selectedSession.duration})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>{selectedSession.instructor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span>{formatTimeInTimezone(selectedSession.startDateTime, userTimezone)} ({userTimezone})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>Video Conference</span>
                </div>
              </div>
              
              {selectedSession.description && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-gray-700">{selectedSession.description}</p>
                </div>
              )}
            </div>

            {/* Meeting Credentials */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Meeting Credentials</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Meeting ID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm">{selectedSession.meetingId}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedSession.meetingId || '')}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Copy Meeting ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Password:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm">{selectedSession.meetingPassword}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedSession.meetingPassword || '')}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Copy Password"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Integration */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Add to Calendar</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => addToGoogleCalendar(selectedSession)}
                  className="flex items-center justify-center space-x-2 p-3 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                >
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Google</span>
                </button>
                <button
                  onClick={() => addToOutlookCalendar(selectedSession)}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                >
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Outlook</span>
                </button>
                <button
                  onClick={() => downloadICSFile(selectedSession)}
                  className="flex items-center justify-center space-x-2 p-3 bg-green-100 hover:bg-green-200 rounded-xl transition-colors"
                >
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Download</span>
                </button>
                <button
                  onClick={() => copyMeetingDetails(selectedSession)}
                  className="flex items-center justify-center space-x-2 p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors"
                >
                  <Share2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Share</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => openVideoConferenceInNewTab(selectedSession)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Open Video Conference
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Check Modal */}
      {showSystemCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">System Requirements Check</h3>
              <button
                onClick={() => setShowSystemCheck(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-gray-600" />
                  <span>Browser Compatibility</span>
                </div>
                {systemRequirements.checking ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : systemRequirements.browser ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-gray-600" />
                  <span>Camera Access</span>
                </div>
                {systemRequirements.checking ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : systemRequirements.camera ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-gray-600" />
                  <span>Microphone Access</span>
                </div>
                {systemRequirements.checking ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : systemRequirements.microphone ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-gray-600" />
                  <span>Network Connection</span>
                </div>
                {systemRequirements.checking ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : systemRequirements.bandwidth ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={checkSystemRequirements}
                className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Recheck
              </button>
              <button
                onClick={() => setShowSystemCheck(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConferenceSchedule;
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import VideoConferenceSchedule from './VideoConferenceSchedule';
import { 
  Home, 
  Calendar, 
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Video,
  Users,
  Target,
  Award,
  BookOpen,
  Shield,
  Smartphone
} from 'lucide-react';

interface UserData {
  firstName: string;
}

interface StudentDashboardProps {
  onLogout: () => void;
  userData: UserData | null;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout, userData }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [showFaceIdConfirm, setShowFaceIdConfirm] = useState(false);
  const [pendingFaceIdState, setPendingFaceIdState] = useState(false);

  // Add touch event handlers for iOS scrolling
  React.useEffect(() => {
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('.scrollable-content');
      
      if (!scrollableParent) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventBounce, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventBounce);
    };
  }, []);

  // Get personalized greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = userData?.firstName || 'Alex';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${firstName}!`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${firstName}!`;
    } else {
      return `Good evening, ${firstName}!`;
    }
  };

  const handleFaceIdToggle = (newState: boolean) => {
    setPendingFaceIdState(newState);
    setShowFaceIdConfirm(true);
  };

  const confirmFaceIdChange = () => {
    setFaceIdEnabled(pendingFaceIdState);
    setShowFaceIdConfirm(false);
    // Here you would typically save the preference to localStorage or backend
    localStorage.setItem('faceIdEnabled', pendingFaceIdState.toString());
  };

  const cancelFaceIdChange = () => {
    setShowFaceIdConfirm(false);
    setPendingFaceIdState(faceIdEnabled);
  };

  // Load FaceID preference on mount
  React.useEffect(() => {
    const savedPreference = localStorage.getItem('faceIdEnabled');
    if (savedPreference !== null) {
      setFaceIdEnabled(savedPreference === 'true');
    }
  }, []);

  const openVideoConferencesInNewTab = () => {
    const conferenceUrl = '/video-conferences';
    const newWindow = window.open(conferenceUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      newWindow.focus();
    } else {
      alert('Please allow popups for this site to open video conferences in new tabs.');
    }
  };

  const upcomingAssignments = [
    { title: 'Math Homework Ch. 5', subject: 'Mathematics', dueDate: 'Tomorrow', priority: 'high', completed: false },
    { title: 'History Essay', subject: 'History', dueDate: 'Oct 25', priority: 'medium', completed: false },
    { title: 'Science Lab Report', subject: 'Physics', dueDate: 'Oct 28', priority: 'low', completed: true },
    { title: 'English Literature Review', subject: 'English', dueDate: 'Nov 2', priority: 'medium', completed: false }
  ];

  const recentActivities = [
    { activity: 'Completed Math Quiz', time: '2 hours ago', type: 'achievement', icon: Award },
    { activity: 'Attended Physics Session', time: '4 hours ago', type: 'session', icon: Video },
    { activity: 'Reviewed Chemistry Notes', time: '1 day ago', type: 'study', icon: BookOpen },
    { activity: 'Joined Study Group', time: '2 days ago', type: 'collaboration', icon: Users }
  ];

  const courses = [
    { 
      name: 'Advanced Mathematics', 
      instructor: 'Dr. Smith', 
      progress: 85, 
      sessions: 24, 
      nextClass: 'Today 2:00 PM',
      color: 'bg-amber-500'
    },
    { 
      name: 'World History', 
      instructor: 'Ms. Johnson', 
      progress: 72, 
      sessions: 18, 
      nextClass: 'Tomorrow 10:00 AM',
      color: 'bg-emerald-600'
    },
    { 
      name: 'Physics Lab', 
      instructor: 'Prof. Wilson', 
      progress: 90, 
      sessions: 15, 
      nextClass: 'Wed 3:00 PM',
      color: 'bg-teal-600'
    },
    { 
      name: 'English Literature', 
      instructor: 'Mrs. Davis', 
      progress: 68, 
      sessions: 22, 
      nextClass: 'Thu 11:00 AM',
      color: 'bg-orange-600'
    }
  ];

  const studySchedule = [
    { time: '9:00 AM', subject: 'Mathematics', type: 'class', duration: '1h 30m', location: 'Room 101' },
    { time: '11:00 AM', subject: 'Study Break', type: 'break', duration: '30m', location: 'Library' },
    { time: '2:00 PM', subject: 'Physics Lab', type: 'lab', duration: '2h', location: 'Lab 205' },
    { time: '5:00 PM', subject: 'History Study Group', type: 'study', duration: '1h', location: 'Study Room A' },
    { time: '7:00 PM', subject: 'English Essay Writing', type: 'homework', duration: '2h', location: 'Home' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-6 space-y-6 pb-24" style={{ minHeight: 'calc(100vh - 140px)' }}>
            {/* Header with Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <img 
                  src="/src/assets/Company Logo copy copy.jpeg"
                  alt="Curio Tutors"
                  className="w-16 h-16 object-contain rounded-2xl shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-amber-900">{getGreeting()}</h1>
                  <p className="text-amber-700">Ready to learn something new today?</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-3 bg-amber-100 rounded-2xl hover:bg-amber-200 transition-colors duration-200 shadow-md relative">
                  <Bell className="h-5 w-5 text-amber-700" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-3 bg-teal-100 rounded-2xl hover:bg-teal-200 transition-colors duration-200 shadow-md">
                  <Search className="h-5 w-5 text-teal-700" />
                </button>
              </div>
            </div>

            {/* Header */}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <Target className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900 mb-1">12</div>
                <div className="text-sm text-amber-700">Completed Tasks</div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-orange-100">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900 mb-1">3</div>
                <div className="text-sm text-amber-700">Due Tomorrow</div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-yellow-100">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <Award className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900 mb-1">88%</div>
                <div className="text-sm text-amber-700">Average Grade</div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-teal-100">
                    <Target className="h-5 w-5 text-teal-600" />
                  </div>
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900 mb-1">4</div>
                <div className="text-sm text-amber-700">Study Goals</div>
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-amber-900">Upcoming Assignments</h3>
                <button className="text-sm text-amber-700 hover:text-amber-900 font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {upcomingAssignments.slice(0, 3).map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        assignment.priority === 'high' ? 'bg-red-500' :
                        assignment.priority === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}></div>
                      <div>
                        <div className="text-amber-900 font-semibold">{assignment.title}</div>
                        <div className="text-sm text-amber-700">{assignment.subject}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-900 text-sm font-medium">{assignment.dueDate}</div>
                      <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                        assignment.completed 
                          ? 'bg-emerald-200 text-emerald-800' 
                          : 'bg-orange-200 text-orange-800'
                      }`}>
                        {assignment.completed ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'achievement' ? 'bg-emerald-200' :
                      activity.type === 'session' ? 'bg-teal-200' :
                      activity.type === 'study' ? 'bg-amber-200' : 'bg-orange-200'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.type === 'achievement' ? 'text-emerald-700' :
                        activity.type === 'session' ? 'text-teal-700' :
                        activity.type === 'study' ? 'text-amber-700' : 'text-orange-700'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-amber-900 font-medium">{activity.activity}</div>
                      <div className="text-sm text-amber-700">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 140px)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Study Schedule</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={openVideoConferencesInNewTab}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  <Video className="h-4 w-4" />
                  <span>Open Video Conferences</span>
                </button>
                <button className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
                <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-amber-700" />
                <span className="text-amber-900 font-semibold">Today - October 24, 2024</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {studySchedule.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-amber-900 font-bold text-lg">{item.time}</div>
                        <div className="text-amber-700 text-sm">{item.duration}</div>
                      </div>
                      <div className={`w-1 h-12 rounded-full ${
                        item.type === 'class' ? 'bg-teal-500' :
                        item.type === 'lab' ? 'bg-emerald-500' :
                        item.type === 'study' ? 'bg-amber-500' :
                        item.type === 'homework' ? 'bg-orange-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-amber-900 font-bold">{item.subject}</h3>
                          {(item.type === 'class' || item.type === 'lab' || item.type === 'study') && (
                            <Video className="h-4 w-4 text-blue-600" title="Video Conference Available" />
                          )}
                        </div>
                        <p className="text-amber-700 text-sm">{item.location}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          item.type === 'class' ? 'bg-teal-100 text-teal-800' :
                          item.type === 'lab' ? 'bg-emerald-100 text-emerald-800' :
                          item.type === 'study' ? 'bg-amber-100 text-amber-800' :
                          item.type === 'homework' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors">
                      <Bell className="h-4 w-4 text-amber-700" />
                      </button>
                      {(item.type === 'class' || item.type === 'lab' || item.type === 'study') && (
                        <button 
                          onClick={openVideoConferencesInNewTab}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Open Video
                    </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );


      case 'settings':
        return (
          <>
            <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 140px)' }}>
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Settings</h2>
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Profile Settings</h3>
                  <div className="space-y-3">
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Edit Profile</span>
                      <span className="text-amber-700">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Change Password</span>
                      <span className="text-amber-700">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Notification Settings</span>
                      <span className="text-amber-700">→</span>
                    </button>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Security Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-amber-700" />
                        <span className="text-amber-900">Face ID Authentication</span>
                      </div>
                      <button
                        onClick={() => handleFaceIdToggle(!faceIdEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          faceIdEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            faceIdEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-amber-700" />
                        <span className="text-amber-900">Two-Factor Authentication</span>
                      </div>
                      <span className="text-amber-700">Off</span>
                    </div>
                  </div>
                </div>

                {/* Learning Preferences */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Learning Preferences</h3>
                  <div className="space-y-3">
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Study Reminders</span>
                      <span className="text-amber-700">On</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Assignment Notifications</span>
                      <span className="text-amber-700">On</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Grade Updates</span>
                      <span className="text-amber-700">On</span>
                    </button>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Support</h3>
                  <div className="space-y-3">
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Help Center</span>
                      <span className="text-amber-700">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Contact Support</span>
                      <span className="text-amber-700">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <span className="text-amber-900">Terms of Service</span>
                      <span className="text-amber-700">→</span>
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-3 w-full p-4 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors duration-200 border border-red-200"
                >
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-semibold">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Face ID Confirmation Modal */}
            {showFaceIdConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      {pendingFaceIdState ? 'Enable' : 'Disable'} Face ID?
                    </h3>
                    <p className="text-amber-700">
                      {pendingFaceIdState 
                        ? 'Face ID will be used for quick and secure authentication.'
                        : 'You will need to use your password to sign in.'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={cancelFaceIdChange}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmFaceIdChange}
                      className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                    >
                      {pendingFaceIdState ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-full min-h-screen flex page-content" style={{
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 50%, #FBBF24 100%)'
    }}>
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userType="student"
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 overflow-y-auto scrollable-content ios-scroll-fix scrollable-area" style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-amber-300 shadow-lg sticky bottom-0 left-0 right-0 z-10 mt-auto">
        <div className="grid grid-cols-3 gap-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-amber-500 text-white shadow-lg transform scale-105'
                  : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
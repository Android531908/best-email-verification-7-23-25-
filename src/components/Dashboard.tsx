import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MessagingInterface from './MessagingInterface';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  GraduationCap
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showMessaging, setShowMessaging] = useState(false);

  // Add touch event handlers for iOS scrolling
  React.useEffect(() => {
    // Prevent iOS bounce/rubber band effect on body
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('.scrollable-content');
      
      if (!scrollableParent) {
        e.preventDefault();
      }
    };

    // Add passive: false to ensure preventDefault works
    document.addEventListener('touchmove', preventBounce, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventBounce);
    };
  }, []);

  // Handle messaging interface
  if (showMessaging) {
    return <MessagingInterface onBack={() => setShowMessaging(false)} />;
  }

  const stats = [
    { label: 'Active Students', value: '24', icon: Users, color: 'text-green-600' },
    { label: 'This Month', value: '$3,240', icon: DollarSign, color: 'text-amber-600' },
    { label: 'Avg Rating', value: '4.9', icon: Star, color: 'text-yellow-600' },
    { label: 'Hours Taught', value: '156', icon: Clock, color: 'text-green-500' }
  ];

  const recentSessions = [
    { student: 'Sarah Johnson', subject: 'Pharmacology', time: '2:00 PM', status: 'upcoming' },
    { student: 'Mike Chen', subject: 'Clinical Assessment', time: '3:30 PM', status: 'upcoming' },
    { student: 'Emily Rodriguez', subject: 'Exam Prep', time: '5:00 PM', status: 'completed' },
    { student: 'Alex Thompson', subject: 'Anatomy Review', time: '6:30 PM', status: 'upcoming' },
    { student: 'Jessica Lee', subject: 'Pathophysiology', time: '7:00 PM', status: 'upcoming' },
    { student: 'David Wilson', subject: 'Medical Ethics', time: '8:00 PM', status: 'completed' },
    { student: 'Maria Garcia', subject: 'Biochemistry', time: '9:00 PM', status: 'upcoming' },
    { student: 'James Brown', subject: 'Microbiology', time: '10:00 PM', status: 'completed' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-6 space-y-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-green-800">Welcome back!</h1>
                <p className="text-green-600">Here's what's happening today</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-3 bg-green-100 rounded-2xl hover:bg-green-200 transition-colors duration-200 shadow-md">
                  <Bell className="h-5 w-5 text-green-600" />
                </button>
                <button className="p-3 bg-amber-100 rounded-2xl hover:bg-amber-200 transition-colors duration-200 shadow-md">
                  <Search className="h-5 w-5 text-amber-600" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${
                      index === 0 ? 'bg-green-100' :
                      index === 1 ? 'bg-amber-100' :
                      index === 2 ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-green-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Today's Sessions */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-800">Today's Sessions</h3>
                <button className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md">
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-amber-50 rounded-xl border border-green-100">
                    <div>
                      <div className="text-green-800 font-semibold">{session.student}</div>
                      <div className="text-sm text-green-600">{session.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-800 text-sm font-medium">{session.time}</div>
                      <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                        session.status === 'upcoming' 
                          ? 'bg-amber-200 text-amber-800' 
                          : 'bg-green-200 text-green-800'
                      }`}>
                        {session.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-2xl shadow-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">New Session</span>
                </div>
              </button>
              <button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white p-4 rounded-2xl shadow-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Add Student</span>
                </div>
              </button>
            </div>

            {/* Additional Content for Scrolling Demo */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
              <h3 className="text-lg font-bold text-green-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-700 text-sm font-bold">{item}</span>
                    </div>
                    <div>
                      <div className="text-green-800 font-medium">Activity {item}</div>
                      <div className="text-sm text-green-600">Sample activity description</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'students':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Students</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((student) => (
                <div key={student} className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <div className="text-green-800 font-semibold">Student {student}</div>
                      <div className="text-sm text-green-600">Grade: A+ | Sessions: {student * 3}</div>
                    </div>
                    <button className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'sessions':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Sessions</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((session) => (
                <div key={session} className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-green-800 font-semibold">Session {session}</div>
                        <div className="text-sm text-green-600">Subject: Mathematics | Duration: 1hr</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-800 text-sm font-medium">Today</div>
                      <div className="text-xs px-3 py-1 rounded-full font-medium bg-green-200 text-green-800">
                        Completed
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Calendar</h2>
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <div key={day} className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-green-800 font-semibold">{day}</h3>
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((event) => (
                      <div key={event} className="p-2 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-800 font-medium">Event {event}</div>
                        <div className="text-xs text-green-600">{9 + event}:00 AM - {10 + event}:00 AM</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Messages</h2>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setShowMessaging(true)}
                className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-2xl shadow-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">Open Messaging</span>
                </div>
              </button>
              <button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white p-4 rounded-2xl shadow-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">New Message</span>
                </div>
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((message) => (
                <div key={message} className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-green-800 font-semibold">Student {message}</div>
                        <div className="text-xs text-green-600">2 min ago</div>
                      </div>
                      <div className="text-sm text-green-600">
                        Thank you for the great session today! I really understand the concept now.
                      </div>
                      <button 
                        onClick={() => setShowMessaging(true)}
                        className="mt-2 text-xs text-green-500 hover:text-green-700 font-medium"
                      >
                        Reply →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-6 pb-24" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Settings</h2>
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-4">Profile Settings</h3>
                <div className="space-y-3">
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Edit Profile</span>
                    <span className="text-green-600">→</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Change Password</span>
                    <span className="text-green-600">→</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Notification Settings</span>
                    <span className="text-green-600">→</span>
                  </button>
                </div>
              </div>

              {/* App Settings */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-4">App Settings</h3>
                <div className="space-y-3">
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Language</span>
                    <span className="text-green-600">English</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Theme</span>
                    <span className="text-green-600">Light</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Privacy</span>
                    <span className="text-green-600">→</span>
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-4">Support</h3>
                <div className="space-y-3">
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Help Center</span>
                    <span className="text-green-600">→</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Contact Support</span>
                    <span className="text-green-600">→</span>
                  </button>
                  <button className="flex items-center justify-between w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-green-800">Terms of Service</span>
                    <span className="text-green-600">→</span>
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
        );
      
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'sessions', icon: BookOpen, label: 'Sessions' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userType="tutor"
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 overflow-y-auto scrollable-content ios-scroll-fix" style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm border-t border-green-200 shadow-lg fixed bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-6 gap-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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

export default Dashboard;
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield,
  Clock,
  Video,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { User } from '../types/conference.types';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

interface Meeting {
  id: string;
  title: string;
  host: string;
  participants: number;
  status: 'active' | 'scheduled' | 'ended';
  startTime: string;
  duration: string;
}

interface Analytics {
  totalMeetings: number;
  activeMeetings: number;
  totalParticipants: number;
  averageDuration: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'users' | 'analytics' | 'settings'>('overview');
  
  // Mock data
  const [meetings] = useState<Meeting[]>([
    {
      id: 'MTG-001',
      title: 'Team Standup',
      host: 'John Doe',
      participants: 8,
      status: 'active',
      startTime: '2024-01-15 09:00',
      duration: '45 min'
    },
    {
      id: 'MTG-002',
      title: 'Client Presentation',
      host: 'Jane Smith',
      participants: 12,
      status: 'scheduled',
      startTime: '2024-01-15 14:00',
      duration: '60 min'
    },
    {
      id: 'MTG-003',
      title: 'Project Review',
      host: 'Mike Johnson',
      participants: 6,
      status: 'ended',
      startTime: '2024-01-14 16:00',
      duration: '30 min'
    }
  ]);

  const analytics: Analytics = {
    totalMeetings: 156,
    activeMeetings: 3,
    totalParticipants: 89,
    averageDuration: '42 min'
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold text-amber-900">{analytics.totalMeetings}</p>
            </div>
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm">Active Sessions</p>
              <p className="text-2xl font-bold text-amber-900">{analytics.activeMeetings}</p>
            </div>
            <Video className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm">Total Participants</p>
              <p className="text-2xl font-bold text-amber-900">{analytics.totalParticipants}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm">Avg Duration</p>
              <p className="text-2xl font-bold text-amber-900">{analytics.averageDuration}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {meetings.slice(0, 5).map(meeting => (
            <div key={meeting.id} className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(meeting.status)}`}></div>
                <div>
                  <p className="text-amber-900 font-medium">{meeting.title}</p>
                  <p className="text-amber-700 text-sm">Host: {meeting.host}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-900 text-sm">{meeting.participants} participants</p>
                <p className="text-amber-700 text-xs">{meeting.startTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMeetings = () => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-amber-900">All Sessions</h3>
        <div className="flex space-x-2">
          <select className="px-3 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Scheduled</option>
            <option>Ended</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-200">
              <th className="text-left text-amber-700 font-medium py-3">Session</th>
              <th className="text-left text-amber-700 font-medium py-3">Host</th>
              <th className="text-left text-amber-700 font-medium py-3">Participants</th>
              <th className="text-left text-amber-700 font-medium py-3">Status</th>
              <th className="text-left text-amber-700 font-medium py-3">Start Time</th>
              <th className="text-left text-amber-700 font-medium py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id} className="border-b border-amber-100 hover:bg-amber-50">
                <td className="py-3">
                  <div>
                    <p className="text-amber-900 font-medium">{meeting.title}</p>
                    <p className="text-amber-600 text-sm">{meeting.id}</p>
                  </div>
                </td>
                <td className="py-3 text-amber-700">{meeting.host}</td>
                <td className="py-3 text-amber-700">{meeting.participants}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    meeting.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {meeting.status}
                  </span>
                </td>
                <td className="py-3 text-amber-700">{meeting.startTime}</td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-amber-100 rounded transition-colors">
                      <Eye className="w-4 h-4 text-amber-600" />
                    </button>
                    <button className="p-1 hover:bg-amber-100 rounded transition-colors">
                      <Edit className="w-4 h-4 text-amber-600" />
                    </button>
                    <button className="p-1 hover:bg-amber-100 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'meetings':
        return renderMeetings();
      case 'users':
        return (
          <div className="bg-black bg-opacity-20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
            <p className="text-gray-300">User management features coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-black bg-opacity-20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analytics & Reports</h3>
            <p className="text-gray-300">Advanced analytics features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-black bg-opacity-20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Settings</h3>
            <p className="text-gray-300">System configuration options coming soon...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-amber-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Admin Dashboard</h1>
              <p className="text-amber-700">Manage your learning platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-amber-900 font-medium">{user.name}</p>
              <p className="text-amber-700 text-sm">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/95 backdrop-blur-sm rounded-xl p-1 border border-amber-200 shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'meetings', label: 'Sessions', icon: Video },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
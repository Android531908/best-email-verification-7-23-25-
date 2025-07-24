import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Calendar, Clock, Users, Lock } from 'lucide-react';
import { User } from '../types/conference.types';

interface CreateMeetingProps {
  onMeetingCreated: (meetingId: string) => void;
  onBack: () => void;
  user: User;
}

const CreateMeeting: React.FC<CreateMeetingProps> = ({ 
  onMeetingCreated, 
  onBack, 
  user 
}) => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isInstantMeeting, setIsInstantMeeting] = useState(true);
  const [generatedMeetingId, setGeneratedMeetingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const generateMeetingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.match(/.{1,3}/g)?.join('-') || result;
  };

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const meetingId = generateMeetingId();
    setGeneratedMeetingId(meetingId);
    setIsCreating(false);
  };

  const handleJoinCreatedMeeting = () => {
    onMeetingCreated(generatedMeetingId);
  };

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(generatedMeetingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy meeting ID:', error);
    }
  };

  const copyMeetingLink = async () => {
    const meetingLink = `${window.location.origin}/meeting/${generatedMeetingId}`;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy meeting link:', error);
    }
  };

  if (generatedMeetingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-amber-200 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Session Created!</h2>
            <p className="text-amber-700">Your learning session is ready to start</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-700 text-sm">Session ID</span>
                <button
                  onClick={copyMeetingId}
                  className="flex items-center space-x-1 text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-amber-900 font-mono text-lg">{generatedMeetingId}</p>
            </div>

            {meetingTitle && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <span className="text-amber-700 text-sm">Session Title</span>
                <p className="text-amber-900">{meetingTitle}</p>
              </div>
            )}

            {requirePassword && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <span className="text-amber-700 text-sm">Password</span>
                <p className="text-amber-900 font-mono">{meetingPassword}</p>
              </div>
            )}

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-700 text-sm">Session Link</span>
                <button
                  onClick={copyMeetingLink}
                  className="flex items-center space-x-1 text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-amber-900 text-sm break-all">
                {window.location.origin}/meeting/{generatedMeetingId}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleJoinCreatedMeeting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
            >
              Start Learning Session
            </button>
            <button
              onClick={onBack}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold py-3 px-4 rounded-lg transition-colors border border-amber-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-amber-200 shadow-2xl">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-amber-700" />
          </button>
          <h2 className="text-2xl font-bold text-amber-900">Create Learning Session</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-amber-700 text-sm font-medium mb-2">
              Session Title (Optional)
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Enter session title"
              className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-amber-700">Session Type</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={isInstantMeeting}
                  onChange={() => setIsInstantMeeting(true)}
                  className="w-4 h-4 text-amber-600"
                />
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-amber-900">Instant Session</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!isInstantMeeting}
                  onChange={() => setIsInstantMeeting(false)}
                  className="w-4 h-4 text-amber-600"
                />
                <Calendar className="w-5 h-5 text-amber-600" />
                <span className="text-amber-900">Scheduled Session</span>
              </label>
            </div>
          </div>

          {!isInstantMeeting && (
            <div>
              <label className="block text-amber-700 text-sm font-medium mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-amber-700 text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Maximum Participants
            </label>
            <select
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value={5}>5 participants</option>
              <option value={10}>10 participants</option>
              <option value={25}>25 participants</option>
              <option value={50}>50 participants</option>
              <option value={100}>100 participants</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePassword}
                onChange={(e) => setRequirePassword(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <Lock className="w-5 h-5 text-amber-600" />
              <span className="text-amber-900">Require Password</span>
            </label>

            {requirePassword && (
              <input
                type="text"
                value={meetingPassword}
                onChange={(e) => setMeetingPassword(e.target.value)}
                placeholder="Enter session password"
                className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            )}
          </div>

          <button
            onClick={handleCreateMeeting}
            disabled={isCreating || (requirePassword && !meetingPassword)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Session...
              </>
            ) : (
              'Create Learning Session'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;
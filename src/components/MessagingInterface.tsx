import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { 
  Send, 
  Paperclip, 
  Bold, 
  Italic, 
  List, 
  AlertTriangle, 
  Clock, 
  Save, 
  Eye, 
  Flag, 
  Check, 
  CheckCheck, 
  User, 
  BookOpen, 
  Calendar,
  X,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Archive,
  Star
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'tutor' | 'student';
  content: string;
  timestamp: Date;
  priority: 'normal' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  flagged?: boolean;
}

interface Student {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  lastActive: string;
  grade: string;
  unreadCount: number;
}

interface MessagingInterfaceProps {
  onBack: () => void;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ onBack }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'normal'>('all');
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample students data
  const students: Student[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      subject: 'Pharmacology',
      lastActive: '2 min ago',
      grade: 'A-',
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'MC',
      subject: 'Clinical Assessment',
      lastActive: '15 min ago',
      grade: 'B+',
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'ER',
      subject: 'Exam Prep',
      lastActive: '1 hour ago',
      grade: 'A',
      unreadCount: 1
    },
    {
      id: '4',
      name: 'Alex Thompson',
      avatar: 'AT',
      subject: 'Anatomy Review',
      lastActive: '3 hours ago',
      grade: 'B',
      unreadCount: 0
    }
  ];

  // Sample messages
  const sampleMessages: Message[] = [
    {
      id: '1',
      senderId: '1',
      senderName: 'Sarah Johnson',
      senderType: 'student',
      content: 'Hi Dr. Smith, I\'m having trouble understanding the mechanism of action for ACE inhibitors. Could you help explain it?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'normal',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'tutor',
      senderName: 'Dr. Smith',
      senderType: 'tutor',
      content: 'Of course! ACE inhibitors work by blocking the angiotensin-converting enzyme. This prevents the conversion of angiotensin I to angiotensin II, which is a potent vasoconstrictor.',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      priority: 'normal',
      status: 'read'
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Sarah Johnson',
      senderType: 'student',
      content: 'That makes sense! So by blocking this conversion, we reduce vasoconstriction and lower blood pressure?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'normal',
      status: 'read'
    },
    {
      id: '4',
      senderId: '1',
      senderName: 'Sarah Johnson',
      senderType: 'student',
      content: 'Also, I have my exam tomorrow. Could you send me some practice questions if you have any?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      priority: 'urgent',
      status: 'delivered'
    }
  ];

  // Quick reply templates
  const quickTemplates = [
    "Great question! Let me explain...",
    "I'll send you some additional resources.",
    "Please review the material we discussed and let me know if you have questions.",
    "Excellent work on your assignment!",
    "Let's schedule a session to go over this topic.",
    "I've attached some practice problems for you."
  ];

  // Auto-save functionality
  useEffect(() => {
    if (newMessage.trim() && !showPreview) {
      const timer = setTimeout(() => {
        setIsDraft(true);
        // Auto-save logic would go here
        console.log('Draft saved:', newMessage);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [newMessage, showPreview]);

  // Load messages for selected student
  useEffect(() => {
    if (selectedStudent) {
      setMessages(sampleMessages);
      scrollToBottom();
    }
  }, [selectedStudent]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudent) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'tutor',
      senderName: 'Dr. Smith',
      senderType: 'tutor',
      content: newMessage,
      timestamp: new Date(),
      priority,
      status: 'sent',
      attachments: attachments.length > 0 ? attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file)
      })) : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setPriority('normal');
    setAttachments([]);
    setIsDraft(false);
    setShowPreview(false);
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertTemplate = (template: string) => {
    setNewMessage(template);
    setShowTemplates(false);
    messageInputRef.current?.focus();
  };

  const formatText = (format: 'bold' | 'italic' | 'list') => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newMessage.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = `• ${selectedText}`;
        break;
    }

    const newText = newMessage.substring(0, start) + formattedText + newMessage.substring(end);
    setNewMessage(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const toggleMessageFlag = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, flagged: !msg.flagged } : msg
    ));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(msg => {
    if (filterPriority === 'all') return true;
    return msg.priority === filterPriority;
  });

  if (!selectedStudent) {
    return (
      <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        {/* Students List */}
        <div className="w-full max-w-md bg-white shadow-lg border-r border-green-200">
          {/* Header */}
          <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-500 to-green-600">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                <Plus className="h-5 w-5 text-white" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>

          {/* Students List */}
          <div className="flex-1 overflow-y-auto scrollable-content">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="w-full p-4 border-b border-green-100 hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-800 font-bold">{student.avatar}</span>
                    </div>
                    {student.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{student.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-green-800 font-semibold">{student.name}</h3>
                      <span className="text-xs text-green-600">{student.lastActive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">{student.subject}</p>
                      <span className="text-xs text-green-800 font-medium">Grade: {student.grade}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Sidebar */}
      <Sidebar 
        activeItem="messages"
        userType="tutor"
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedStudent(null)}
              className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
            >
              <X className="h-5 w-5 text-green-600" />
            </button>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-800 font-bold">{selectedStudent.avatar}</span>
            </div>
            <div>
              <h2 className="text-green-800 font-bold">{selectedStudent.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <BookOpen className="h-3 w-3" />
                <span>{selectedStudent.subject}</span>
                <span>•</span>
                <span>Grade: {selectedStudent.grade}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterPriority(filterPriority === 'urgent' ? 'all' : 'urgent')}
              className={`p-2 rounded-xl transition-colors ${
                filterPriority === 'urgent' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
              <MoreVertical className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollable-content p-4 space-y-4">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'tutor' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.senderType === 'tutor' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-4 rounded-2xl ${
                  message.senderType === 'tutor'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-green-200'
                }`}
              >
                {message.priority === 'urgent' && (
                  <div className="flex items-center space-x-1 mb-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium text-red-500">Urgent</span>
                  </div>
                )}
                
                <p className={`text-sm ${message.senderType === 'tutor' ? 'text-white' : 'text-green-800'}`}>
                  {message.content}
                </p>
                
                {message.attachments && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg">
                        <Paperclip className="h-3 w-3" />
                        <span className="text-xs">{attachment.name}</span>
                        <span className="text-xs opacity-70">({attachment.size})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${message.senderType === 'tutor' ? 'text-white/70' : 'text-green-600'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center space-x-1">
                    {message.senderType === 'tutor' && (
                      <div className="flex items-center">
                        {message.status === 'sent' && <Check className="h-3 w-3 text-white/70" />}
                        {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-white/70" />}
                        {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-300" />}
                      </div>
                    )}
                    <button
                      onClick={() => toggleMessageFlag(message.id)}
                      className={`p-1 rounded ${message.flagged ? 'text-yellow-400' : 'text-white/50 hover:text-white/70'}`}
                    >
                      <Flag className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-green-200 p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-green-100 rounded-lg p-2">
                <Paperclip className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-800">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Templates */}
        {showTemplates && (
          <div className="mb-3 bg-green-50 rounded-xl p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2">Quick Replies</h4>
            <div className="grid grid-cols-1 gap-1">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => insertTemplate(template)}
                  className="text-left text-sm text-green-700 hover:bg-green-100 rounded-lg p-2 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Preview */}
        {showPreview && (
          <div className="mb-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-800">Message Preview</h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg max-w-xs">
              <p className="text-sm">{newMessage}</p>
              {priority === 'urgent' && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-red-300" />
                  <span className="text-xs">Urgent</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4 text-green-600" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4 text-green-600" />
            </button>
            <button
              onClick={() => formatText('list')}
              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              title="Bullet Point"
            >
              <List className="h-4 w-4 text-green-600" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              title="Attach File"
            >
              <Paperclip className="h-4 w-4 text-green-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileAttachment}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2 rounded-lg transition-colors ${
                showTemplates ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title="Quick Templates"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPriority(priority === 'urgent' ? 'normal' : 'urgent')}
              className={`p-2 rounded-lg transition-colors ${
                priority === 'urgent' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title="Priority"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showPreview ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Input Area */}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setNewMessage(e.target.value);
                  setIsDraft(false);
                }
              }}
              placeholder="Type your message..."
              className="w-full p-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
              rows={3}
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <span>{newMessage.length}/2000</span>
                {isDraft && (
                  <div className="flex items-center space-x-1">
                    <Save className="h-3 w-3" />
                    <span>Draft saved</span>
                  </div>
                )}
              </div>
              {scheduleTime && (
                <div className="flex items-center space-x-1 text-xs text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>Scheduled: {scheduleTime}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Schedule Options */}
        <div className="flex items-center justify-between mt-2">
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="text-xs p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300"
            min={new Date().toISOString().slice(0, 16)}
          />
          <div className="text-xs text-green-600">
            {priority === 'urgent' && '⚠️ Urgent message'}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MessagingInterface;
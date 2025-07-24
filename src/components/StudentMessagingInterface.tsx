import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  ArrowLeft, 
  MoreVertical, 
  Reply, 
  Quote,
  Check, 
  CheckCheck, 
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'tutor' | 'student';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    thumbnail?: string;
  }>;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  edited?: boolean;
  editedAt?: Date;
}

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface StudentMessagingInterfaceProps {
  onBack: () => void;
}

const StudentMessagingInterface: React.FC<StudentMessagingInterfaceProps> = ({ onBack }) => {
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Map<string, string>>(new Map());
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Sample tutors data
  const tutors: Tutor[] = [
    {
      id: '1',
      name: 'Dr. Smith',
      avatar: 'DS',
      subject: 'Mathematics',
      isOnline: true
    },
    {
      id: '2',
      name: 'Prof. Johnson',
      avatar: 'PJ',
      subject: 'Physics',
      isOnline: false,
      lastSeen: '2 hours ago'
    },
    {
      id: '3',
      name: 'Ms. Davis',
      avatar: 'MD',
      subject: 'Chemistry',
      isOnline: true
    }
  ];

  // Sample messages
  const sampleMessages: Message[] = [
    {
      id: '1',
      senderId: '1',
      senderName: 'Dr. Smith',
      senderType: 'tutor',
      content: 'Hi Alex! I saw your question about quadratic equations. Let me help you understand the concept better.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: 'read'
    },
    {
      id: '2',
      senderId: 'student',
      senderName: 'Alex',
      senderType: 'student',
      content: 'Thank you! I\'m particularly struggling with the discriminant part. When do we use it?',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      status: 'read',
      replyTo: {
        messageId: '1',
        content: 'Hi Alex! I saw your question about quadratic equations...',
        senderName: 'Dr. Smith'
      }
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Dr. Smith',
      senderType: 'tutor',
      content: 'Great question! The discriminant (b² - 4ac) tells us about the nature of the roots. Let me send you a visual explanation.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'read',
      attachments: [
        {
          id: 'att1',
          name: 'quadratic_discriminant.pdf',
          type: 'application/pdf',
          size: '2.3 MB',
          url: '#',
          thumbnail: '/api/placeholder/100/100'
        }
      ]
    },
    {
      id: '4',
      senderId: 'student',
      senderName: 'Alex',
      senderType: 'student',
      content: 'This is really helpful! Could you also explain when we get complex roots?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'delivered'
    }
  ];

  // Auto-save drafts
  useEffect(() => {
    if (newMessage.trim() && selectedTutor) {
      const timer = setTimeout(() => {
        setDrafts(prev => new Map(prev.set(selectedTutor.id, newMessage)));
        console.log('Draft saved for', selectedTutor.name);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [newMessage, selectedTutor]);

  // Load messages and draft when tutor is selected
  useEffect(() => {
    if (selectedTutor) {
      setMessages(sampleMessages);
      const savedDraft = drafts.get(selectedTutor.id);
      if (savedDraft) {
        setNewMessage(savedDraft);
      }
      scrollToBottom();
    }
  }, [selectedTutor]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTutor) return;

    const messageId = Date.now().toString();
    const message: Message = {
      id: messageId,
      senderId: 'student',
      senderName: 'Alex',
      senderType: 'student',
      content: newMessage,
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments.length > 0 ? attachments.map((file, index) => ({
        id: `att_${messageId}_${index}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })) : undefined,
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        content: replyingTo.content.substring(0, 50) + (replyingTo.content.length > 50 ? '...' : ''),
        senderName: replyingTo.senderName
      } : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setAttachments([]);
    setReplyingTo(null);
    
    // Clear draft
    if (selectedTutor) {
      setDrafts(prev => {
        const newDrafts = new Map(prev);
        newDrafts.delete(selectedTutor.id);
        return newDrafts;
      });
    }

    // Simulate message delivery
    try {
      await simulateMessageDelivery(messageId);
    } catch (error) {
      setFailedMessages(prev => new Set(prev.add(messageId)));
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const simulateMessageDelivery = async (messageId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!isConnected || Math.random() < 0.05) { // 5% failure rate
          reject(new Error('Network error'));
          return;
        }

        // Update to sent
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        ));

        // Simulate delivery confirmation
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'delivered' } : msg
          ));

          // Simulate read receipt
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === messageId ? { ...msg, status: 'read' } : msg
            ));
            resolve();
          }, 2000);
        }, 1000);
      }, 500);
    });
  };

  const retryFailedMessage = async (messageId: string) => {
    setFailedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'sending' } : msg
    ));

    try {
      await simulateMessageDelivery(messageId);
    } catch (error) {
      setFailedMessages(prev => new Set(prev.add(messageId)));
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    setAttachments(prev => [...prev, ...validFiles]);
    
    if (files.length !== validFiles.length) {
      alert('Some files were too large (max 10MB) and were not added.');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (!selectedTutor) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-green-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-green-600" />
            </button>
            <h1 className="text-xl font-bold text-green-800">Messages</h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>
        </div>

        {/* Tutors List */}
        <div className="flex-1 overflow-y-auto scrollable-content p-4">
          <div className="space-y-3">
            {tutors.map((tutor) => (
              <button
                key={tutor.id}
                onClick={() => setSelectedTutor(tutor)}
                className="w-full p-4 bg-white rounded-2xl shadow-lg border border-green-100 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-800 font-bold">{tutor.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      tutor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-green-800 font-semibold">{tutor.name}</h3>
                    <p className="text-sm text-green-600">{tutor.subject}</p>
                    {!tutor.isOnline && tutor.lastSeen && (
                      <p className="text-xs text-gray-500">Last seen {tutor.lastSeen}</p>
                    )}
                  </div>
                  <div className="text-green-600">
                    <span className="text-xs">
                      {tutor.isOnline ? 'Online' : 'Offline'}
                    </span>
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
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedTutor(null)}
              className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-green-600" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-800 font-bold">{selectedTutor.avatar}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                selectedTutor.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-green-800 font-bold">{selectedTutor.name}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600">{selectedTutor.subject}</span>
                <span className="text-gray-400">•</span>
                <span className={`${selectedTutor.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                  {selectedTutor.isOnline ? 'Online' : `Last seen ${selectedTutor.lastSeen}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
            <button className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
              <MoreVertical className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-100 border-b border-red-200 p-2">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Connection lost. Messages will be sent when reconnected.</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollable-content p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.senderType === 'student' ? 'order-2' : 'order-1'}`}>
              {/* Reply Reference */}
              {message.replyTo && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-1 mb-1">
                    <Reply className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">{message.replyTo.senderName}</span>
                  </div>
                  <p className="text-xs text-gray-700">{message.replyTo.content}</p>
                </div>
              )}

              <div
                className={`p-4 rounded-2xl ${
                  message.senderType === 'student'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-green-200'
                }`}
              >
                <p className={`text-sm ${message.senderType === 'student' ? 'text-white' : 'text-green-800'}`}>
                  {message.content}
                </p>
                
                {/* Attachments */}
                {message.attachments && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg">
                        {getFileIcon(attachment.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.name}</p>
                          <p className="text-xs opacity-70">{attachment.size}</p>
                        </div>
                        <button className="p-1 hover:bg-white/20 rounded">
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${message.senderType === 'student' ? 'text-white/70' : 'text-green-600'}`}>
                    {formatTimestamp(message.timestamp)}
                    {message.edited && ' (edited)'}
                  </span>
                  <div className="flex items-center space-x-1">
                    {message.senderType === 'student' && getStatusIcon(message.status)}
                    {message.status === 'failed' && (
                      <button
                        onClick={() => retryFailedMessage(message.id)}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Retry"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}
                    {message.senderType === 'tutor' && (
                      <button
                        onClick={() => handleReply(message)}
                        className="p-1 hover:bg-green-100 rounded"
                        title="Reply"
                      >
                        <Reply className="h-3 w-3 text-green-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && selectedTutor.isOnline && (
          <div className="flex justify-start">
            <div className="bg-white border border-green-200 rounded-2xl p-4 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-green-600">{selectedTutor.name} is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-green-200 p-4">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Reply className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Replying to {replyingTo.senderName}
                </span>
              </div>
              <button
                onClick={cancelReply}
                className="p-1 hover:bg-green-200 rounded"
              >
                <X className="h-4 w-4 text-green-600" />
              </button>
            </div>
            <p className="text-sm text-green-700 bg-white p-2 rounded border-l-4 border-green-500">
              {replyingTo.content.substring(0, 100)}
              {replyingTo.content.length > 100 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-green-100 rounded-lg p-2">
                {getFileIcon(file.type)}
                <span className="text-xs text-green-800 max-w-20 truncate">{file.name}</span>
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

        {/* Message Input Area */}
        <div className="flex items-end space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5 text-green-600" />
          </button>
          
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-green-600">
                {drafts.has(selectedTutor.id) ? 'Draft saved' : 'Press Enter to send, Shift+Enter for new line'}
              </span>
              <span className="text-xs text-green-600">{newMessage.length}/2000</span>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileAttachment}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
        />
      </div>
    </div>
  );
};

export default StudentMessagingInterface;
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  Settings, 
  Bell,
  Search,
  Plus,
  TrendingUp,
  Award,
  Target,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  submenu?: SidebarItem[];
  onClick?: () => void;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  userType?: 'student' | 'tutor';
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'home', 
  onItemClick,
  userType = 'student',
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Student sidebar items
  const studentItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      onClick: () => handleItemClick('home')
    },
    {
      id: 'schedule',
      label: 'My Schedule',
      icon: Calendar,
      badge: 3,
      onClick: () => handleItemClick('schedule')
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      submenu: [
        { id: 'math', label: 'Mathematics', icon: Target },
        { id: 'physics', label: 'Physics', icon: TrendingUp },
        { id: 'chemistry', label: 'Chemistry', icon: Award }
      ]
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: Target,
      badge: 5,
      onClick: () => handleItemClick('assignments')
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: 2,
      onClick: () => handleItemClick('messages')
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: TrendingUp,
      onClick: () => handleItemClick('progress')
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      onClick: () => handleItemClick('achievements')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => handleItemClick('settings')
    }
  ];

  // Tutor sidebar items
  const tutorItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      onClick: () => handleItemClick('home')
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      badge: 24,
      onClick: () => handleItemClick('students')
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: BookOpen,
      submenu: [
        { id: 'upcoming', label: 'Upcoming', icon: Clock, badge: 8 },
        { id: 'completed', label: 'Completed', icon: Target },
        { id: 'cancelled', label: 'Cancelled', icon: X }
      ]
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      onClick: () => handleItemClick('schedule')
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: 12,
      onClick: () => handleItemClick('messages')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      onClick: () => handleItemClick('analytics')
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      onClick: () => handleItemClick('resources')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => handleItemClick('settings')
    }
  ];

  const sidebarItems = userType === 'student' ? studentItems : tutorItems;

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
    setIsMobileOpen(false);
  };

  const toggleSubmenu = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.id);
            } else {
              item.onClick?.();
            }
          }}
          className={`
            w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
            ${level > 0 ? 'ml-4 pl-8' : ''}
            ${isActive 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105' 
              : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
            }
            ${isCollapsed && level === 0 ? 'justify-center' : ''}
            focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2
          `}
          aria-label={item.label}
          aria-expanded={hasSubmenu ? isExpanded : undefined}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-amber-700'} transition-colors`} />
            {!isCollapsed && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {item.badge && item.badge > 0 && (
                <span className={`
                  px-2 py-1 text-xs font-bold rounded-full min-w-[20px] text-center
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500 text-white'
                  }
                `}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {hasSubmenu && (
                <ChevronRight className={`
                  h-4 w-4 transition-transform duration-200
                  ${isExpanded ? 'rotate-90' : ''}
                  ${isActive ? 'text-white' : 'text-amber-600'}
                `} />
              )}
            </div>
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && isExpanded && !isCollapsed && (
          <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.submenu!.map(subItem => renderSidebarItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className={`
      h-full flex flex-col bg-gradient-to-b from-amber-50 to-orange-50 border-r border-amber-200 shadow-xl
      ${isCollapsed ? 'w-20' : 'w-72'}
      transition-all duration-300 ease-in-out
    `}>
      {/* Header */}
      <div className="p-6 border-b border-amber-200 bg-white/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/src/assets/Company Logo copy copy.jpeg"
                alt="Curio Tutors"
                className="w-10 h-10 object-contain rounded-xl shadow-md"
              />
              <div>
                <h2 className="text-lg font-bold text-amber-900">Curio Tutors</h2>
                <p className="text-xs text-amber-700 capitalize">{userType} Portal</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-amber-700" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-amber-700" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-amber-200">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center p-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">New</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md">
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {sidebarItems.map(item => renderSidebarItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-200 bg-white/30">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userType === 'student' ? 'S' : 'T'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 truncate">
                {userType === 'student' ? 'Alex Student' : 'Dr. Smith'}
              </p>
              <p className="text-xs text-amber-700 truncate">
                {userType === 'student' ? 'Grade A Student' : 'Mathematics Tutor'}
              </p>
            </div>
            <button className="p-1 hover:bg-amber-200 rounded-lg transition-colors">
              <Bell className="h-4 w-4 text-amber-700" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userType === 'student' ? 'S' : 'T'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-amber-500 text-white rounded-xl shadow-lg hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 h-full z-40 ${className}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <aside className="relative w-72 h-full animate-in slide-in-from-left duration-300">
            {sidebarContent}
            
            {/* Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-amber-700" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
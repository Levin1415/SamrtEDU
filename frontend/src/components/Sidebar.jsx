import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, MessageSquare, Calendar, Clock, 
  FileText, Award, BarChart3, Settings, BookOpen, ClipboardList 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/ai-chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/student/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/student/daily-plan', icon: Clock, label: 'Daily Plan' },
    { to: '/student/timetable', icon: FileText, label: 'Timetable' },
    { to: '/student/assessments', icon: ClipboardList, label: 'Assessments' },
    { to: '/student/badges', icon: Award, label: 'Badges' },
    { to: '/student/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/lesson-plan', icon: BookOpen, label: 'Lesson Plans' },
    { to: '/teacher/assessments', icon: ClipboardList, label: 'Assessments' },
    { to: '/teacher/timetable', icon: FileText, label: 'Timetable' },
    { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const links = user?.role === 'student' ? studentLinks : teacherLinks;
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary mb-8">SmartAcad</h2>
        <nav className="space-y-2">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

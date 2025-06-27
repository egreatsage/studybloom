'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  FaChalkboardTeacher,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaUsers
} from 'react-icons/fa';

const menuItems = [
  { path: '/teacher', icon: FaChalkboardTeacher, label: 'Dashboard' },
  { path: '/teacher/schedule', icon: FaCalendarAlt, label: 'My Schedule' },
  { path: '/teacher/attendance', icon: FaClipboardList, label: 'Attendance' },

  { path: '/teacher/grading', icon: FaGraduationCap, label: 'Assignments' },
  { path: '/teacher/my-students', icon: FaUsers, label: 'My Students' },
   { path: '/teacher/my-notifications', icon: FaBell, label: 'Notifications' },
];

export default function TeacherSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="my-8 ml-2 rounded-md">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white"
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-40 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          lg:translate-x-0 lg:static ${isExpanded ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 bg-white rounded-full p-1.5 shadow-md text-gray-500 hover:text-green-600"
        >
          {isExpanded ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
        </button>

        {/* Logo/Header */}
        <div className="p-6 border-b lg:flex lg:flex-col">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${!isExpanded ? 'lg:hidden' : ''}`}>
              <h1 className="text-xl font-bold text-green-600">StudyBloom Teacher</h1>
              {session?.user && (
                <div className="mt-2 text-sm">
                  <p className="text-gray-600">{session.user.name}</p>
                  <p className="text-gray-500 capitalize">{session.user.role}</p>
                </div>
              )}
            </div>
            <div className={`hidden lg:block ${isExpanded ? 'lg:hidden' : ''}`}>
              <FaChalkboardTeacher className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`group flex items-center space-x-3 p-3 rounded-lg transition-colors relative
                      ${!isExpanded && 'lg:justify-center lg:space-x-0'}
                      ${isActive 
                        ? 'bg-green-50 text-green-600' 
                        : 'text-gray-700 hover:bg-green-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`text-xl ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${!isExpanded && 'lg:hidden'}`}>{item.label}</span>
                    
                    {/* Tooltip - Only show on desktop when collapsed */}
                    {!isExpanded && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 mt-auto border-t">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`group flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors relative
              ${!isExpanded && 'lg:justify-center lg:space-x-0'}`}
          >
            <FaSignOutAlt className="text-xl" />
            <span className={`font-medium ${!isExpanded && 'lg:hidden'}`}>Sign Out</span>
            
            {/* Tooltip for Sign Out - Only show on desktop when collapsed */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

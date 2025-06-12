'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaUniversity, 
  FaBuilding,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
  FaChevronLeft,
  FaChevronRight,
  FaCog
} from 'react-icons/fa';

const menuItems = [
  { path: '/admin/users', icon: FaUsers, label: 'Users' },
  { path: '/admin/schools', icon: FaUniversity, label: 'Schools' },
  { path: '/admin/departments', icon: FaBuilding, label: 'Departments' },
  { path: '/admin/courses', icon: FaGraduationCap, label: 'Courses' },
  { path: '/admin/units', icon: FaUniversity, label: 'Units' },
  { path: '/admin/teaching-assignments', icon: FaChalkboardTeacher, label: 'Teaching Assignments' },
  { path: '/admin/timetables', icon: FaCalendarAlt, label: 'Timetables' },
  { path: '/admin/venues', icon: FaMapMarkerAlt, label: 'Venues' },
];

export default function AdminSidebar() {
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-600 text-white"
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-40 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isExpanded ? 'w-64' : 'w-20'}
          lg:translate-x-0 lg:static`}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 bg-white rounded-full p-1.5 shadow-md text-gray-500 hover:text-slate-600"
        >
          {isExpanded ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
        </button>

        {/* Logo/Header */}
        <div className={`p-6 border-b ${!isExpanded && 'flex justify-center'}`}>
          {isExpanded ? (
            <>
              <h1 className="text-xl font-bold text-slate-800">StudyBloom Admin</h1>
              {session?.user && (
                <div className="mt-2 text-sm">
                  <p className="text-slate-600 font-semibold">{session.user.name}</p>
                  <p className="text-slate-500 capitalize">{session.user.role}</p>
                </div>
              )}
            </>
          ) : (
            <FaCog className="text-2xl text-slate-600" />
          )}
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
                    className={`group flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'} p-3 rounded-lg transition-colors relative
                      ${isActive 
                        ? 'bg-slate-50 text-slate-800' 
                        : 'text-gray-700 hover:bg-slate-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`text-xl ${isActive ? 'text-slate-800' : 'text-gray-400'}`} />
                    {isExpanded && <span className="font-medium">{item.label}</span>}
                    
                    {/* Tooltip */}
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
        <div className={`p-4 mt-auto border-t ${!isExpanded && 'flex justify-center'}`}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`group flex items-center ${isExpanded ? 'space-x-3 w-full' : 'justify-center'} p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors relative`}
          >
            <FaSignOutAlt className="text-xl" />
            {isExpanded && <span className="font-medium">Sign Out</span>}
            
            {/* Tooltip for Sign Out */}
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

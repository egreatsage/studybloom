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
  FaChalkboardTeacher
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
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className='my-8 ml-2 rounded-md'>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-64 lg:static`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">StudyBloom (Admin)</h1>
          {session?.user && (
            <div className="mt-2 text-sm">
              <p className="text-green-400 font-bold">{session.user.name}</p>
              
            </div>
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
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-slate-50 text-gray-600' 
                        : 'text-gray-700 hover:bg-slate-100'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`text-xl ${isActive ? 'text-gray-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
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
            className="flex cursor-pointer items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="font-medium">Sign Out</span>
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

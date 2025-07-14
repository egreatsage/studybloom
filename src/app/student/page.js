'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useUnitRegistrationStore from '@/lib/stores/unitRegistrationStore';
import SemesterInfo from '@/components/SemesterInfo';
import UnitRegistration from '@/components/UnitRegistration';
import RegisteredUnits from '@/components/RegisteredUnits';
import AssignmentsList from '@/components/AssignmentsList';
import AttendanceSummary from '@/components/student/AttendanceSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import TotalScoreCard from '@/components/student/TotalScoreCard'; // Import the new component
import useEnrollmentStore from '@/lib/stores/enrollmentStore';
import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  Users, 
  GraduationCap,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Award,
  Clock
} from 'lucide-react';

const StudentDashboard = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    currentSemester, 
    fetchCurrentSemester,
    getCurrentSemesterRegistrations 
  } = useUnitRegistrationStore();

  useEffect(() => {
    fetchCurrentSemester();
  }, [fetchCurrentSemester]);
  const { courses: enrolledCourses, fetchEnrolledCourses } = useEnrollmentStore();
  const currentRegistrations = getCurrentSemesterRegistrations();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'register', label: 'Register Units', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: GraduationCap }
      
  ];
  console.log(session)

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                  <p className="text-sm text-gray-500">{currentDate}</p>
                </div>
              </div>
            </div>

            {/* Right side - User info and notifications */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>
            

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       

        {/* Semester Information */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50">
            <SemesterInfo />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-white/50">
              <nav className="flex space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Navigation</h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRight className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                {isMobileMenuOpen && (
                  <div className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
                <RegisteredUnits />
              </div>
              {enrolledCourses.map(course => (
                  <TotalScoreCard key={course._id} courseId={course._id} />
                ))}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
                <AttendanceSummary />
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
              <UnitRegistration />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
              <AttendanceSummary />
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {currentRegistrations.length === 0 ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Units Registered</h3>
                  <p className="text-yellow-700 mb-4">
                    You need to register for units before you can view assignments.
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Register Units Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Unit Selection - Mobile: Full width, Desktop: 2 columns */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span>Select a Unit</span>
                      </h2>
                      <div className="space-y-3">
                        {currentRegistrations.map((registration) => (
                          <button
                            key={registration._id}
                            onClick={() => setSelectedUnit(registration.unit)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                              selectedUnit?._id === registration.unit._id
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md'
                                : 'bg-white/50 border-gray-200 hover:bg-white/70 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">{registration.unit.code}</div>
                                <div className="text-sm text-gray-600 mt-1">{registration.unit.name}</div>
                              </div>
                              <ChevronRight className={`w-4 h-4 transition-transform ${
                                selectedUnit?._id === registration.unit._id ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Assignments Display - Mobile: Full width, Desktop: 3 columns */}
                  <div className="lg:col-span-3">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        <span>Unit Assignments</span>
                      </h2>
                      {selectedUnit ? (
                        <AssignmentsList
                          unitId={selectedUnit._id}
                          isTeacher={false}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-2">No unit selected</p>
                          <p className="text-sm text-gray-400">Choose a unit from the left to view its assignments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
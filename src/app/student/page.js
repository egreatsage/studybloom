'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useUnitRegistrationStore from '@/lib/stores/unitRegistrationStore';
import SemesterInfo from '@/components/SemesterInfo';
import UnitRegistration from '@/components/UnitRegistration';
import RegisteredUnits from '@/components/RegisteredUnits';
import AssignmentsList from '@/components/AssignmentsList';
import AttendanceSummary from '@/components/student/AttendanceSummary'; // Import new component
import LoadingSpinner from '@/components/LoadingSpinner';

const StudentDashboard = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const { 
    currentSemester, 
    fetchCurrentSemester,
    getCurrentSemesterRegistrations 
  } = useUnitRegistrationStore();

  useEffect(() => {
    fetchCurrentSemester();
  }, [fetchCurrentSemester]);

  const currentRegistrations = getCurrentSemesterRegistrations();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name || 'Student'}</p>
      </div>

      {/* Semester Information */}
      <div className="mb-8">
        <SemesterInfo />
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Register Units
            </button>
             <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignments
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RegisteredUnits />
            <AttendanceSummary />
          </div>
        )}

        {activeTab === 'register' && (
          <div className="space-y-6">
            <UnitRegistration />
          </div>
        )}

        {activeTab === 'attendance' && (
            <AttendanceSummary />
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {currentRegistrations.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-700">
                  You need to register for units before you can view assignments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registered Units List */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Select a Unit</h2>
                  <div className="space-y-2">
                    {currentRegistrations.map((registration) => (
                      <button
                        key={registration._id}
                        onClick={() => setSelectedUnit(registration.unit)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedUnit?._id === registration.unit._id
                            ? 'bg-blue-50 border-blue-300 border'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{registration.unit.code}</div>
                        <div className="text-sm text-gray-600">{registration.unit.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignments for Selected Unit */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Unit Assignments</h2>
                  {selectedUnit ? (
                    <AssignmentsList
                      unitId={selectedUnit._id}
                      isTeacher={false}
                    />
                  ) : (
                    <p className="text-gray-500">Select a unit to view its assignments</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
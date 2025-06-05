'use client';

import { useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useUnitRegistrationStore from '@/lib/stores/unitRegistrationStore';

const SemesterInfo = () => {
  const { currentSemester, loading, fetchCurrentSemester } = useUnitRegistrationStore();

  useEffect(() => {
    fetchCurrentSemester();
  }, [fetchCurrentSemester]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (!currentSemester) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <FaInfoCircle className="text-yellow-600 text-xl" />
          <div>
            <h3 className="font-semibold text-yellow-800">No Active Semester</h3>
            <p className="text-yellow-700 text-sm mt-1">
              There is no active semester at the moment. Unit registration is not available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (currentSemester.daysRemaining <= 7) return 'text-red-600 bg-red-50';
    if (currentSemester.daysRemaining <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <FaCalendarAlt className="text-blue-600" />
          <span>Current Semester</span>
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          Active
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{currentSemester.name}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="font-medium">{formatDate(currentSemester.startDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="font-medium">{formatDate(currentSemester.endDate)}</p>
          </div>
        </div>

        <div className={`rounded-lg p-4 ${getStatusColor()}`}>
          <div className="flex items-center space-x-2">
            <FaClock />
            <p className="font-medium">
              {currentSemester.daysRemaining} days remaining
            </p>
          </div>
          <p className="text-sm mt-1 opacity-90">
            Registration is open during the semester period
          </p>
        </div>

        {currentSemester.courses && currentSemester.courses.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Active Courses</p>
            <div className="flex flex-wrap gap-2">
              {currentSemester.courses.map((course) => (
                <span
                  key={course._id}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {course.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterInfo;

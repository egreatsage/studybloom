'use client';

import { useEffect } from 'react';
import { FaBook, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useUnitRegistrationStore from '@/lib/stores/unitRegistrationStore';

const RegisteredUnits = () => {
  const {
    registrations,
    currentSemester,
    loading,
    fetchRegistrations,
    dropUnit,
    getCurrentSemesterRegistrations
  } = useUnitRegistrationStore();

  useEffect(() => {
    if (currentSemester) {
      fetchRegistrations();
    }
  }, [currentSemester, fetchRegistrations]);

  const currentRegistrations = getCurrentSemesterRegistrations();

  if (loading && registrations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!currentSemester) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-600 text-center">
          No active semester found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <FaBook className="text-blue-600" />
          <span>My Registered Units</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Units registered for {currentSemester.name}
        </p>
      </div>

      {currentRegistrations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>You have not registered for any units this semester.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {currentRegistrations.map((registration) => (
            <div key={registration._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {registration.unit.code} - {registration.unit.name}
                  </h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <FaCalendarAlt />
                      <span>
                        Registered on {new Date(registration.registrationDate).toLocaleDateString()}
                      </span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.status}
                    </span>
                  </div>
                </div>
                
                {registration.status === 'active' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to drop this unit?')) {
                        dropUnit(registration._id);
                      }
                    }}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FaTimes />
                    <span>Drop</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">
          Total registered units: <span className="font-medium">{currentRegistrations.length}</span>
        </p>
      </div>
    </div>
  );
};

export default RegisteredUnits;

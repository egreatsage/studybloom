'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaLock, FaSpinner, FaTimes, FaExclamationCircle, FaUsers, FaClock, FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useUnitRegistrationStore from '@/lib/stores/unitRegistrationStore';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

const UnitRegistration = () => {
  const {
    availableUnits,
    currentSemester,
    registrations,
    loading,
    fetchAvailableUnits,
    fetchRegistrations,
    registerForUnit,
    dropUnit
  } = useUnitRegistrationStore();

  const [processingUnit, setProcessingUnit] = useState(null);
  const [registrationInfo, setRegistrationInfo] = useState(null);

  useEffect(() => {
    if (currentSemester?._id) {
      fetchAvailableUnits(currentSemester._id).then((data) => {
        if (data?.registrationInfo) {
          setRegistrationInfo(data.registrationInfo);
        }
      });
      fetchRegistrations();
    }
  }, [currentSemester, fetchAvailableUnits, fetchRegistrations]);

  const handleRegister = async (unitId) => {
    if (!currentSemester?._id) {
      toast.error('No active semester found');
      return;
    }

    if (!registrationInfo?.canRegisterMore) {
      toast.error(`Maximum unit limit (${registrationInfo.maxAllowed}) reached`);
      return;
    }

    setProcessingUnit(unitId);
    try {
      await registerForUnit(unitId, currentSemester._id);
      // Refresh registration info
      const data = await fetchAvailableUnits(currentSemester._id);
      if (data?.registrationInfo) {
        setRegistrationInfo(data.registrationInfo);
      }
    } finally {
      setProcessingUnit(null);
    }
  };

  const handleDrop = async (unitId) => {
    const registration = registrations.find(
      reg => reg.unit._id === unitId && reg.semester._id === currentSemester._id
    );
    
    if (!registration) {
      toast.error('Registration not found');
      return;
    }

    setProcessingUnit(unitId);
    try {
      await dropUnit(registration._id);
      // Refresh registration info
      const data = await fetchAvailableUnits(currentSemester._id);
      if (data?.registrationInfo) {
        setRegistrationInfo(data.registrationInfo);
      }
    } finally {
      setProcessingUnit(null);
    }
  };

  const getUnitStatusMessage = (unit) => {
    if (unit.isRegistered) return 'Registered';
    if (unit.isFull) return 'Full';
    if (!unit.prerequisitesMet) return 'Prerequisites Required';
    if (!registrationInfo?.registrationOpen) return 'Registration Closed';
    if (!registrationInfo?.canRegisterMore) return 'Max Units Reached';
    return 'Register';
  };

  const getUnitStatusColor = (unit) => {
    if (unit.isRegistered) return 'text-green-600';
    if (unit.isFull) return 'text-red-600';
    if (!unit.prerequisitesMet) return 'text-orange-600';
    if (!registrationInfo?.registrationOpen) return 'text-gray-600';
    if (!registrationInfo?.canRegisterMore) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (loading && availableUnits.length === 0) {
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-700">
          No active semester. Unit registration is not available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration Period Banner */}
      {registrationInfo && (
        <div className={`p-4 rounded-lg ${
          registrationInfo.registrationOpen 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <FaClock className={`mt-1 ${
              registrationInfo.registrationOpen ? 'text-green-600' : 'text-red-600'
            }`} />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                Registration Period: {format(new Date(registrationInfo.registrationStartDate), 'MMM d')} - 
                {format(new Date(registrationInfo.registrationEndDate), 'MMM d, yyyy')}
              </h3>
              
              {registrationInfo.registrationOpen ? (
                <div>
                  <p className="text-green-700">
                    Registration is OPEN - {registrationInfo.daysRemaining} days remaining
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-sm">
                      Registered Units: <strong>{registrationInfo.currentCount}/{registrationInfo.maxAllowed}</strong>
                    </span>
                    {registrationInfo.currentCount >= registrationInfo.maxAllowed && (
                      <span className="text-sm text-orange-600 flex items-center">
                        <FaExclamationCircle className="mr-1" />
                        Maximum units reached
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-red-700">
                  Registration is CLOSED
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Units List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Available Units for Registration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Register for units in {currentSemester.name}
          </p>
        </div>

        {!availableUnits || availableUnits.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600 text-center">
              No units available for registration in your course.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {availableUnits.map((unit) => {
              const isProcessing = processingUnit === unit._id;
              const statusMessage = getUnitStatusMessage(unit);
              const statusColor = getUnitStatusColor(unit);

              return (
                <div
                  key={unit._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    unit.isRegistered ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-lg">
                          {unit.code} - {unit.name}
                        </h3>
                        {unit.capacity && (
                          <span className={`text-sm px-2 py-1 rounded flex items-center space-x-1 ${
                            unit.isFull ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <FaUsers className="text-xs" />
                            <span>{unit.enrolledCount}/{unit.capacity}</span>
                          </span>
                        )}
                      </div>
                      
                      {unit.description && (
                        <p className="text-gray-600 text-sm mt-1">{unit.description}</p>
                      )}

                      {/* Prerequisites */}
                      {unit.hasPrerequisites && unit.prerequisites && (
                        <div className="mt-2 flex items-start space-x-2">
                          <FaInfoCircle className={`text-sm mt-0.5 ${
                            unit.prerequisitesMet ? 'text-green-600' : 'text-orange-600'
                          }`} />
                          <div>
                            <p className="text-xs text-gray-500">Prerequisites:</p>
                            <p className={`text-sm ${
                              unit.prerequisitesMet ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {unit.prerequisites.map(p => p.code).join(', ')}
                              {!unit.prerequisitesMet && ' (Not met)'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Available Slots */}
                      {unit.capacity && !unit.isFull && (
                        <p className="text-sm text-gray-500 mt-1">
                          {unit.availableSlots} slots available
                        </p>
                      )}
                    </div>

                    <div className="ml-4">
                      {isProcessing ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg flex items-center space-x-2"
                        >
                          <FaSpinner className="animate-spin" />
                          <span>Processing...</span>
                        </button>
                      ) : unit.isRegistered ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-green-600 flex items-center space-x-1">
                            <FaCheck />
                            <span>Registered</span>
                          </span>
                          {registrationInfo?.registrationOpen && (
                            <button
                              onClick={() => handleDrop(unit._id)}
                              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                              <FaTimes />
                              <span>Drop</span>
                            </button>
                          )}
                        </div>
                      ) : unit.canRegister && registrationInfo?.canRegisterMore ? (
                        <button
                          onClick={() => handleRegister(unit._id)}
                          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <FaPlus />
                          <span>Register</span>
                        </button>
                      ) : (
                        <div className="text-right">
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                          >
                            <FaLock />
                            <span>{statusMessage}</span>
                          </button>
                          <p className={`text-xs mt-1 ${statusColor}`}>
                            {unit.isFull && 'No slots available'}
                            {!unit.prerequisitesMet && 'Complete prerequisites first'}
                            {!registrationInfo?.registrationOpen && 'Registration period ended'}
                            {!registrationInfo?.canRegisterMore && unit.canRegister && 'Unit limit reached'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitRegistration;

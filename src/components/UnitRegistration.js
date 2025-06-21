'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaLock, FaSpinner, FaTimes, FaExclamationCircle, FaUsers, FaClock, FaInfoCircle, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
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
    if (unit.isRegistered) return 'text-emerald-600';
    if (unit.isFull) return 'text-red-600';
    if (!unit.prerequisitesMet) return 'text-amber-600';
    if (!registrationInfo?.registrationOpen) return 'text-slate-600';
    if (!registrationInfo?.canRegisterMore) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (loading && availableUnits.length === 0) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg border border-slate-200/50 backdrop-blur-sm p-8">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-600 font-medium">Loading available units...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSemester) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-full">
            <FaExclamationCircle className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800">No Active Semester</h3>
            <p className="text-amber-700 text-sm">
              Unit registration is not available at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
          <FaGraduationCap className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Unit Registration
        </h1>
        <p className="text-slate-600 text-lg">
          Register for units in {currentSemester.name}
        </p>
      </div>

      {/* Registration Period Banner */}
      {registrationInfo && (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg border backdrop-blur-sm ${
          registrationInfo.registrationOpen 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/60'
        }`}>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full shadow-sm ${
                  registrationInfo.registrationOpen ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  <FaClock className={`text-lg ${
                    registrationInfo.registrationOpen ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    Registration Period
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {format(new Date(registrationInfo.registrationStartDate), 'MMM d')} - 
                    {format(new Date(registrationInfo.registrationEndDate), 'MMM d, yyyy')}
                  </p>
                  
                  {registrationInfo.registrationOpen ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-emerald-700 font-medium text-sm">
                        Open - {registrationInfo.daysRemaining} days remaining
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-700 font-medium text-sm">
                        Registration Closed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {registrationInfo.registrationOpen && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="text-sm font-semibold">
                      {registrationInfo.currentCount}/{registrationInfo.maxAllowed}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(registrationInfo.currentCount / registrationInfo.maxAllowed) * 100}%` }}
                    ></div>
                  </div>
                  {registrationInfo.currentCount >= registrationInfo.maxAllowed && (
                    <div className="flex items-center mt-2 text-amber-600">
                      <FaExclamationCircle className="mr-1 text-xs" />
                      <span className="text-xs font-medium">Maximum units reached</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Units Grid */}
      {!availableUnits || availableUnits.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaGraduationCap className="text-slate-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Units Available</h3>
            <p className="text-slate-600">
              No units are currently available for registration in your course.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableUnits.map((unit) => {
            const isProcessing = processingUnit === unit._id;
            const statusMessage = getUnitStatusMessage(unit);
            const statusColor = getUnitStatusColor(unit);

            return (
              <div
                key={unit._id}
                className={`group relative overflow-hidden rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  unit.isRegistered 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60' 
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/60 hover:border-slate-300/60'
                }`}
              >
                {/* Card Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-slate-900 transition-colors">
                          {unit.code}
                        </h3>
                        {unit.isRegistered && (
                          <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                            <FaCheck className="text-xs" />
                            <span>Enrolled</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-700 mb-3 leading-tight">
                        {unit.name}
                      </h4>
                    </div>
                  </div>

                  {/* Description */}
                  {unit.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {unit.description}
                    </p>
                  )}

                  {/* Capacity Info */}
                  {unit.capacity && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-white/60 rounded-lg border border-white/40">
                      <div className="flex items-center space-x-2">
                        <FaUsers className="text-slate-400 text-sm" />
                        <span className="text-sm font-medium text-slate-700">Capacity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          unit.isFull ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {unit.enrolledCount}/{unit.capacity}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          unit.isFull ? 'bg-red-500' : unit.availableSlots < 5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                      </div>
                    </div>
                  )}

                  {/* Available Slots */}
                  {unit.capacity && !unit.isFull && (
                    <p className="text-xs text-slate-500 mb-4 bg-slate-100 px-2 py-1 rounded">
                      {unit.availableSlots} slots remaining
                    </p>
                  )}

                  {/* Prerequisites */}
                  {unit.hasPrerequisites && unit.prerequisites && (
                    <div className="mb-4 p-3 bg-white/60 rounded-lg border border-white/40">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaInfoCircle className={`text-sm ${
                          unit.prerequisitesMet ? 'text-emerald-600' : 'text-amber-600'
                        }`} />
                        <span className="text-xs font-medium text-slate-600">Prerequisites</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {unit.prerequisites.map((prereq, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              unit.prerequisitesMet 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {prereq.code}
                          </span>
                        ))}
                      </div>
                      {!unit.prerequisitesMet && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Complete prerequisites first
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  {isProcessing ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all"
                    >
                      <FaSpinner className="animate-spin" />
                      <span>Processing...</span>
                    </button>
                  ) : unit.isRegistered ? (
                    <div className="space-y-2">
                      <div className="w-full px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center space-x-2 font-medium">
                        <FaCheck />
                        <span>Registered</span>
                      </div>
                      {registrationInfo?.registrationOpen && (
                        <button
                          onClick={() => handleDrop(unit._id)}
                          className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all hover:shadow-sm"
                        >
                          <FaTimes />
                          <span>Drop Unit</span>
                        </button>
                      )}
                    </div>
                  ) : unit.canRegister && registrationInfo?.canRegisterMore ? (
                    <button
                      onClick={() => handleRegister(unit._id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all transform hover:scale-105 hover:shadow-lg"
                    >
                      <FaPlus />
                      <span>Register</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center space-x-2 font-medium cursor-not-allowed"
                      >
                        <FaLock />
                        <span>{statusMessage}</span>
                      </button>
                      <p className={`text-xs text-center ${statusColor} font-medium`}>
                        {unit.isFull && 'No slots available'}
                        {!unit.prerequisitesMet && 'Complete prerequisites first'}
                        {!registrationInfo?.registrationOpen && 'Registration period ended'}
                        {!registrationInfo?.canRegisterMore && unit.canRegister && 'Unit limit reached'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-slate-100/30 to-slate-200/30 rounded-full -translate-x-10 translate-y-10"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnitRegistration;
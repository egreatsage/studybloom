import { create } from 'zustand';
import { toast } from 'react-hot-toast';

// Client-side error message mapping
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    REGISTRATION_CLOSED: 'The registration period has ended. Please contact your academic advisor.',
    MAX_UNITS_EXCEEDED: 'You have reached the maximum number of units allowed for this semester.',
    UNIT_FULL: 'This unit is full. Please select another unit or contact your department.',
    MISSING_PREREQUISITES: 'You must complete the prerequisite units before registering for this unit.',
    ALREADY_REGISTERED: 'You are already registered for this unit.',
    NOT_ENROLLED_IN_COURSE: 'This unit is not available for your course.',
    SEMESTER_NOT_FOUND: 'The selected semester was not found.',
    UNIT_NOT_FOUND: 'The selected unit was not found.',
    USER_NOT_FOUND: 'User information not found.'
  };

  return errorMessages[errorCode] || 'An unknown error occurred.';
};

const useUnitRegistrationStore = create((set, get) => ({
  registrations: [],
  availableUnits: [],
  currentSemester: null,
  registrationInfo: null,
  loading: false,
  error: null,

  fetchCurrentSemester: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/semesters/current');
      if (!res.ok) throw new Error('Failed to fetch current semester');
      const data = await res.json();
      
      // Check if the response has a 'current' property (no active semester case)
      if (data.hasOwnProperty('current') && data.current === null) {
        set({ currentSemester: null, loading: false });
        toast.error('No active semester found');
      } else if (data.isActive) {
        // If the response has isActive, it's the semester data itself
        set({ currentSemester: data, loading: false });
      } else {
        set({ currentSemester: null, loading: false });
        toast.error('No active semester found');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to fetch semester: ${error.message}`);
    }
  },

  fetchRegistrations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/unit-registrations');
      if (!res.ok) throw new Error('Failed to fetch registrations');
      const data = await res.json();
      set({ registrations: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  fetchAvailableUnits: async (semesterId) => {
    if (!semesterId) {
      toast.error('No semester selected');
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/unit-registrations/available?semesterId=${semesterId}`);
      if (!res.ok) throw new Error('Failed to fetch available units');
      const data = await res.json();
      set({ 
        availableUnits: data.units, 
        registrationInfo: data.registrationInfo,
        loading: false 
      });
      return data; // Return data for component use
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to fetch available units: ${error.message}`);
    }
  },

  registerForUnit: async (unitId, semesterId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/unit-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unitId, semesterId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // Handle validation errors
        if (errorData.validationErrors) {
          const errorMessages = errorData.validationErrors.map(err => 
            getErrorMessage(err.code)
          ).join('\n');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.error || 'Failed to register for unit');
      }

      const data = await res.json();
      
      // Update local state
      set((state) => ({
        registrations: [...state.registrations, data],
        availableUnits: state.availableUnits.map(unit => 
          unit._id === unitId 
            ? { ...unit, isRegistered: true, canRegister: false, enrolledCount: (unit.enrolledCount || 0) + 1 }
            : unit
        ),
        registrationInfo: state.registrationInfo ? {
          ...state.registrationInfo,
          currentCount: state.registrationInfo.currentCount + 1,
          canRegisterMore: state.registrationInfo.currentCount + 1 < state.registrationInfo.maxAllowed
        } : null,
        loading: false
      }));

      toast.success('Successfully registered for unit');
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  dropUnit: async (registrationId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/unit-registrations?id=${registrationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to drop unit');

      // Find the unit ID from the registration being dropped
      const droppedRegistration = get().registrations.find(reg => reg._id === registrationId);
      const unitId = droppedRegistration?.unit?._id;

      // Update local state
      set((state) => ({
        registrations: state.registrations.filter(reg => reg._id !== registrationId),
        availableUnits: state.availableUnits.map(unit => 
          unit._id === unitId 
            ? { 
                ...unit, 
                isRegistered: false, 
                canRegister: !unit.isFull && unit.prerequisitesMet && state.registrationInfo?.registrationOpen,
                enrolledCount: Math.max(0, (unit.enrolledCount || 0) - 1)
              }
            : unit
        ),
        registrationInfo: state.registrationInfo ? {
          ...state.registrationInfo,
          currentCount: Math.max(0, state.registrationInfo.currentCount - 1),
          canRegisterMore: true
        } : null,
        loading: false
      }));

      toast.success('Successfully dropped unit');
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to drop unit: ${error.message}`);
    }
  },

  // Helper function to get registrations for current semester
  getCurrentSemesterRegistrations: () => {
    const { registrations, currentSemester } = get();
    if (!currentSemester) return [];
    
    return registrations.filter(
      reg => reg.semester._id === currentSemester._id && reg.status === 'active'
    );
  },

  // Helper function to check if a unit is registered
  isUnitRegistered: (unitId) => {
    const { registrations, currentSemester } = get();
    if (!currentSemester) return false;
    
    return registrations.some(
      reg => reg.unit._id === unitId && 
             reg.semester._id === currentSemester._id && 
             reg.status === 'active'
    );
  }
}));

export default useUnitRegistrationStore;

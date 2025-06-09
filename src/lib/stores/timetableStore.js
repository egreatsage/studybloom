import { create } from 'zustand';

const useTimetableStore = create((set, get) => ({
  // State
  timetables: [],
  currentTimetable: null,
  lectures: [],
  venues: [],
  units: [],
  teachers: [],
  filters: {},
  view: 'week', // 'day', 'week', 'month'
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setView: (view) => set({ view }),
  setFilters: (filters) => set({ filters }),

  fetchTimetables: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/timetables?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timetables');
      }

      const timetables = await response.json();
      set({ timetables, loading: false });
      return timetables;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchLectures: async (timetableId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/lectures?timetableId=${timetableId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lectures');
      }

      const lectures = await response.json();
      set({ lectures, loading: false });
      return lectures;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createLecture: async (lectureData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lectureData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lecture');
      }

      const newLecture = await response.json();
      set(state => ({
        lectures: [...state.lectures, newLecture],
        loading: false
      }));
      return newLecture;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

   createTimetable: async (timetableData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(timetableData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create timetable');
      }

      const newTimetable = await response.json();
      set(state => ({
        timetables: [...state.timetables, newTimetable],
        loading: false
      }));
      return newTimetable;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLecture: async (lectureId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/lectures?id=${lectureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lecture');
      }

      const updatedLecture = await response.json();
      set(state => ({
        lectures: state.lectures.map(lecture =>
          lecture._id === lectureId ? updatedLecture : lecture
        ),
        loading: false
      }));
      return updatedLecture;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteLecture: async (lectureId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/lectures?id=${lectureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lecture');
      }

      set(state => ({
        lectures: state.lectures.filter(lecture => lecture._id !== lectureId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTimetable: async (timetableId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/timetables?id=${timetableId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete timetable');
      }

      set(state => ({
        timetables: state.timetables.filter(timetable => timetable._id !== timetableId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  publishTimetable: async (timetableId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/timetables/${timetableId}/publish`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish timetable');
      }

      const responseData = await response.json();
      const publishedTimetable = responseData.timetable; // Correctly access the nested timetable object

      set(state => ({
        timetables: state.timetables.map(timetable =>
          timetable._id === timetableId ? publishedTimetable : timetable
        ),
        currentTimetable: state.currentTimetable?._id === timetableId 
          ? publishedTimetable 
          : state.currentTimetable,
        loading: false
      }));
      return publishedTimetable;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  updateTimetable: async (timetableId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/timetables?id=${timetableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update timetable');
      }

      const updatedTimetable = await response.json();
      set(state => ({
        timetables: state.timetables.map(timetable =>
          timetable._id === timetableId ? updatedTimetable : timetable
        ),
        loading: false
      }));
      return updatedTimetable;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

 checkConflicts: async (lectureData) => {
    try {
      const response = await fetch('/api/lectures/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lectureData)
      });

      // If the response is not OK, try to parse the JSON body for details.
      if (!response.ok) {
        // Check if the server sent a conflict error (status 400)
        if (response.status === 400) {
            const conflictDetails = await response.json();
            // Return the detailed conflict object so the UI can use it
            return conflictDetails; 
        }
        // For other errors (like 500), throw a generic error.
        throw new Error(`Failed to check conflicts: ${response.statusText}`);
      }

      // If response is OK (200), there are no conflicts.
      const noConflicts = await response.json();
      return noConflicts;

    } catch (error) {
      // This will now catch network errors or actual server failures.
      console.error('Conflict check error:', error);
      // Re-throw the error to be handled by the component
      throw error;
    }
  },

  exportTimetable: async (format = 'pdf') => {
    const { currentTimetable } = get();
    if (!currentTimetable) {
      throw new Error('No timetable selected');
    }

    try {
      const response = await fetch(`/api/timetables/${currentTimetable._id}/export?format=${format}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export timetable');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timetable-${currentTimetable._id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Venue-related actions
  fetchVenues: async () => {
    try {
      const response = await fetch('/api/venues', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const venues = await response.json();
      set({ venues });
      return venues;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  checkVenueAvailability: async (venueId, dateTime) => {
    try {
      const response = await fetch(`/api/venues/availability?venueId=${venueId}&dateTime=${dateTime}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check venue availability');
      }

      const availability = await response.json();
      return availability;
    } catch (error) {
      console.error('Venue availability check error:', error);
      return { available: false };
    }
  },

  // Fetch teachers from users with role=teacher
  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/users?role=teacher', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const teachers = await response.json();
      set({ teachers, loading: false });
      return teachers;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch units for a course
  fetchUnits: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/units?courseId=${courseId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }

      const units = await response.json();
      set({ units, loading: false });
      return units;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearStore: () => set({
    timetables: [],
    currentTimetable: null,
    lectures: [],
    venues: [],
    units: [],
    teachers: [],
    filters: {},
    view: 'week',
    loading: false,
    error: null
  })
}));

export default useTimetableStore;

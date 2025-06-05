import { create } from 'zustand';

const useTimetableStore = create((set, get) => ({
  // State
  timetables: [],
  currentTimetable: null,
  lectures: [],
  venues: [],
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

  publishTimetable: async (timetableId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/timetables/${timetableId}/publish`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish timetable');
      }

      const publishedTimetable = await response.json();
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

  checkConflicts: async (lectureData) => {
    try {
      const response = await fetch('/api/lectures/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lectureData)
      });

      if (!response.ok) {
        throw new Error('Failed to check conflicts');
      }

      const conflicts = await response.json();
      return conflicts;
    } catch (error) {
      console.error('Conflict check error:', error);
      return [];
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

  // Clear store
  clearStore: () => set({
    timetables: [],
    currentTimetable: null,
    lectures: [],
    venues: [],
    filters: {},
    view: 'week',
    loading: false,
    error: null
  })
}));

export default useTimetableStore;

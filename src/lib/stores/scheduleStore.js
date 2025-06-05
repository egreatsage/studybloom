import { create } from 'zustand';

const useScheduleStore = create((set, get) => ({
  // State
  mySchedule: [],
  calendarEvents: [],
  selectedDate: new Date(),
  viewMode: 'week',
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  fetchMySchedule: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/students/schedule', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      const schedule = await response.json();
      set({ mySchedule: schedule, loading: false });
      return schedule;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCalendarEvents: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetch(`/api/students/calendar?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const events = await response.json();
      set({ calendarEvents: events, loading: false });
      return events;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  syncToCalendar: async (provider) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/students/schedule/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }

      const result = await response.json();
      set({ loading: false });
      
      // Handle OAuth redirect if needed
      if (result.authUrl) {
        window.open(result.authUrl, '_blank');
      }
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  downloadSchedule: async (format = 'ical') => {
    try {
      const response = await fetch(`/api/students/schedule/export?format=${format}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download schedule');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-schedule.${format === 'ical' ? 'ics' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Teacher-specific actions
  fetchTeacherSchedule: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/teachers/schedule', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teacher schedule');
      }

      const schedule = await response.json();
      set({ mySchedule: schedule, loading: false });
      return schedule;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLectureInstance: async (lectureId, date, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/lectures/${lectureId}/instance/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update lecture instance');
      }

      const updatedInstance = await response.json();
      
      // Update local state
      set(state => ({
        mySchedule: state.mySchedule.map(item => 
          item._id === lectureId && item.date === date 
            ? { ...item, ...updatedInstance }
            : item
        ),
        loading: false
      }));
      
      return updatedInstance;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility functions
  getScheduleForDate: (date) => {
    const { mySchedule } = get();
    const dayOfWeek = date.getDay();
    
    return mySchedule.filter(lecture => lecture.dayOfWeek === dayOfWeek);
  },

  getScheduleForWeek: (weekStart) => {
    const { mySchedule } = get();
    const weekSchedule = {};
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayOfWeek = day.getDay();
      
      weekSchedule[dayOfWeek] = mySchedule.filter(
        lecture => lecture.dayOfWeek === dayOfWeek
      );
    }
    
    return weekSchedule;
  },

  // Clear store
  clearStore: () => set({
    mySchedule: [],
    calendarEvents: [],
    selectedDate: new Date(),
    viewMode: 'week',
    loading: false,
    error: null
  })
}));

export default useScheduleStore;

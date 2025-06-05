'use client';

import { create } from 'zustand';

const useEnrollmentStore = create((set) => ({
  courses: [],
  loading: false,
  error: null,

  fetchEnrolledCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/enrollments');
      if (!response.ok) throw new Error('Failed to fetch enrolled courses');
      const data = await response.json();
      // Extract courses from enrollments
      const enrolledCourses = data.map(enrollment => enrollment.course);
      set({ courses: enrolledCourses, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearEnrollments: () => {
    set({ courses: [], loading: false, error: null });
  }
}));

export default useEnrollmentStore;

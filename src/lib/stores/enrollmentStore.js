'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useEnrollmentStore = create((set, get) => ({
  enrollments: [],
  loading: false,
  error: null,

  // Fetch enrollments for a course
  fetchCourseStudents: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/enrollments?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course students');
      const data = await response.json();
      set({ enrollments: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load students');
    } finally {
      set({ loading: false });
    }
  },

  // Fetch enrollments for a student
  fetchStudentCourses: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/enrollments?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student courses');
      const data = await response.json();
      set({ enrollments: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load courses');
    } finally {
      set({ loading: false });
    }
  },

  // Create a new enrollment
  createEnrollment: async (studentId, courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create enrollment');
      }
      
      const newEnrollment = await response.json();
      set(state => ({
        enrollments: [...state.enrollments, newEnrollment]
      }));
      
      toast.success('Student enrolled successfully');
      return newEnrollment;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to enroll student');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete an enrollment
  deleteEnrollment: async (enrollmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/enrollments?id=${enrollmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete enrollment');
      
      set(state => ({
        enrollments: state.enrollments.filter(e => e._id !== enrollmentId)
      }));
      
      toast.success('Enrollment removed successfully');
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to remove enrollment');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Check if a student is enrolled in a course
  isEnrolled: (studentId, courseId) => {
    return get().enrollments.some(
      e => e.student._id === studentId && e.course._id === courseId
    );
  },

  // Get enrollment details
  getEnrollment: (studentId, courseId) => {
    return get().enrollments.find(
      e => e.student._id === studentId && e.course._id === courseId
    );
  },

  // Clear all enrollments from store
  clearEnrollments: () => {
    set({ enrollments: [], error: null });
  },
}));

export default useEnrollmentStore;

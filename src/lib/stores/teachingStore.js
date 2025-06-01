'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useTeachingStore = create((set, get) => ({
  assignments: [],
  loading: false,
  error: null,

  // Fetch teaching assignments for a course
  fetchCourseTeachers: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/teaching-assignments?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course teachers');
      const data = await response.json();
      set({ assignments: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load teachers');
    } finally {
      set({ loading: false });
    }
  },

  // Fetch teaching assignments for a teacher
  fetchTeacherCourses: async (teacherId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/teaching-assignments?teacherId=${teacherId}`);
      if (!response.ok) throw new Error('Failed to fetch teacher courses');
      const data = await response.json();
      set({ assignments: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load courses');
    } finally {
      set({ loading: false });
    }
  },

  // Create a new teaching assignment
  createAssignment: async (teacherId, courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/teaching-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, courseId }),
      });
      
      if (!response.ok) throw new Error('Failed to create teaching assignment');
      
      const newAssignment = await response.json();
      set(state => ({
        assignments: [...state.assignments, newAssignment]
      }));
      
      toast.success('Teacher assigned successfully');
      return newAssignment;
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to assign teacher');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete a teaching assignment
  deleteAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/teaching-assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete teaching assignment');
      
      set(state => ({
        assignments: state.assignments.filter(a => a._id !== assignmentId)
      }));
      
      toast.success('Teaching assignment removed');
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to remove teaching assignment');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Clear all assignments from store
  clearAssignments: () => {
    set({ assignments: [], error: null });
  },
}));

export default useTeachingStore;

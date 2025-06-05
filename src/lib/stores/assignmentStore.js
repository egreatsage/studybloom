'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useAssignmentStore = create((set, get) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,

  // Fetch assignments for a unit
  fetchAssignments: async (unitId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments?unitId=${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch unit assignments');
      const data = await response.json();
      set({ assignments: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load assignments', { duration: 2000 });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch a single assignment
  fetchAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      if (!response.ok) throw new Error('Failed to fetch assignment');
      const data = await response.json();
      set({ currentAssignment: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load assignment', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Create a new assignment
  createAssignment: async (assignmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create assignment');
      }
      
      const newAssignment = await response.json();
      set(state => ({
        assignments: [...state.assignments, newAssignment]
      }));
      
      toast.success('Assignment created successfully', { duration: 2000 });
      return newAssignment;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to create assignment', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update an assignment
  updateAssignment: async (assignmentId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update assignment');
      }
      
      const updatedAssignment = await response.json();
      set(state => ({
        assignments: state.assignments.map(a => 
          a._id === assignmentId ? updatedAssignment : a
        ),
        currentAssignment: state.currentAssignment?._id === assignmentId 
          ? updatedAssignment 
          : state.currentAssignment
      }));
      
      toast.success('Assignment updated successfully', { duration: 2000 });
      return updatedAssignment;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to update assignment', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete an assignment
  deleteAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete assignment');
      
      set(state => ({
        assignments: state.assignments.filter(a => a._id !== assignmentId),
        currentAssignment: state.currentAssignment?._id === assignmentId 
          ? null 
          : state.currentAssignment
      }));
      
      toast.success('Assignment deleted successfully', { duration: 2000 });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to delete assignment', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Submit an assignment (for students)
  submitAssignment: async (assignmentId, submissionData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit assignment');
      }
      
      const updatedAssignment = await response.json();
      set(state => ({
        assignments: state.assignments.map(a => 
          a._id === assignmentId ? updatedAssignment : a
        ),
        currentAssignment: state.currentAssignment?._id === assignmentId 
          ? updatedAssignment 
          : state.currentAssignment
      }));
      
      toast.success('Assignment submitted successfully', { duration: 2000 });
      return updatedAssignment;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to submit assignment', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Grade an assignment submission (for teachers)
  gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to grade submission');
      }
      
      const updatedAssignment = await response.json();
      set(state => ({
        assignments: state.assignments.map(a => 
          a._id === assignmentId ? updatedAssignment : a
        ),
        currentAssignment: state.currentAssignment?._id === assignmentId 
          ? updatedAssignment 
          : state.currentAssignment
      }));
      
      toast.success('Submission graded successfully', { duration: 2000 });
      return updatedAssignment;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to grade submission', { duration: 2000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Set current assignment
  setCurrentAssignment: (assignment) => {
    set({ currentAssignment: assignment });
  },

  // Clear current assignment
  clearCurrentAssignment: () => {
    set({ currentAssignment: null });
  },

  // Clear all assignments from store
  clearAssignments: () => {
    set({ assignments: [], currentAssignment: null, error: null });
  },
}));

export default useAssignmentStore;

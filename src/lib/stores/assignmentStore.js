'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useAssignmentStore = create((set, get) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,

 fetchAssignments: async (unitId) => {
    // This logic handles a call with no arguments, or a specific unitId
    const isSpecificFetch = typeof unitId === 'string' && unitId;
    
    set({ loading: true, error: null });
    try {
      const url = isSpecificFetch
        ? `/api/assignments?unitId=${unitId}`
        : '/api/assignments'; // It should use this general URL for students

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch assignments');
      }
      const data = await response.json();
      set({ assignments: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message || 'Failed to fetch assignments');
    }
  },
  createAssignment: async (assignmentData) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }
      toast.success('Assignment created successfully',{ duration: 3000 });
      // Re-fetch the assignments for the relevant unit
      get().fetchAssignments(assignmentData.unitId);
    } catch (error) {
      toast.error(error.message || 'Failed to create assignment');
      throw error;
    }
  },

  updateAssignment: async (assignmentId, updateData) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId, ...updateData }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update assignment');
      }
      toast.success('Assignment updated successfully');
      // Re-fetch the assignments for the relevant unit
      get().fetchAssignments(updateData.unitId);
    } catch (error) {
      toast.error(error.message || 'Failed to update assignment');
      throw error;
    }
  },

  deleteAssignment: async (assignmentId, unitId) => {
    try {
      const response = await fetch(`/api/assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete assignment');
      }
      toast.success('Assignment deleted successfully',{ duration: 3000 });
      // Re-fetch the assignments for the relevant unit
      get().fetchAssignments(unitId);
    } catch (error) {
      toast.error(error.message || 'Failed to delete assignment',{ duration: 3000 });
      throw error;
    }
  },

  // Other functions remain the same...
  fetchAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      if (!response.ok) throw new Error('Failed to fetch assignment');
      const data = await response.json();
      set({ currentAssignment: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error('Failed to load assignment', { duration: 3000 });
      throw error;
    }
  },

   submitAssignment: async (assignmentId, formData) => {
    set({ loading: true, error: null });
    try {
      // The body is now formData, and the Content-Type header is set automatically.
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData, // Send formData directly
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit assignment');
      }
      
      const updatedAssignment = await response.json();
      set(state => ({
        // Update the specific assignment in the list
        assignments: state.assignments.map(a => 
          a._id === assignmentId ? updatedAssignment : a
        ),
        // Update the current assignment if it's the one being viewed
        currentAssignment: state.currentAssignment?._id === assignmentId 
          ? updatedAssignment 
          : state.currentAssignment
      }));
      
      toast.success('Assignment submitted successfully', { duration: 3000 });
      return updatedAssignment;
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message || 'Failed to submit assignment', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

   gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    set({ loading: true, error: null });
    try {
      // 1. Correctly constructs the URL for the API endpoint we just created.
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. Correctly sends the grade and feedback as a JSON payload.
        body: JSON.stringify(gradeData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to grade submission');
      }
      
      const updatedAssignment = await response.json();

      // 3. Correctly updates the state to ensure the UI refreshes everywhere.
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
      set({ error: error.message, loading: false });
      toast.error(error.message || 'Failed to grade submission', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  clearCurrentAssignment: () => set({ currentAssignment: null }),
  clearAssignments: () => set({ assignments: [], currentAssignment: null, error: null }),
}));

export default useAssignmentStore;
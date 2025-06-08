'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useAssignmentStore = create((set, get) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,

  fetchAssignments: async (unitId) => {
    if (!unitId) {
      return set({ assignments: [], loading: false });
    }
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/assignments?unitId=${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
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
      toast.success('Assignment created successfully');
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
      
      toast.success('Submission graded successfully', { duration: 3000 });
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
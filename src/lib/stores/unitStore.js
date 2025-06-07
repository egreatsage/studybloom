'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useUnitStore = create((set, get) => ({
  units: [],
  currentUnit: null,
  loading: false,
  error: null,

  // Fetch units for a course
  fetchUnits: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/units?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course units');
      const data = await response.json();
      set({ units: data });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load units', { duration: 3000 });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch a single unit
  fetchUnit: async (unitId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/units/${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch unit');
      const data = await response.json();
      set({ currentUnit: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load unit', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Create a new unit
  createUnit: async (unitData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create unit');
      }
      
      const newUnit = await response.json();
      set(state => ({
        units: [...state.units, newUnit]
      }));
      
      toast.success('Unit created successfully', { duration: 3000 });
      return newUnit;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to create unit', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update a unit
  updateUnit: async (unitId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update unit');
      }
      
      const updatedUnit = await response.json();
      set(state => ({
        units: state.units.map(u => u._id === unitId ? updatedUnit : u),
        currentUnit: state.currentUnit?._id === unitId ? updatedUnit : state.currentUnit
      }));
      
      toast.success('Unit updated successfully', { duration: 3000 });
      return updatedUnit;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to update unit', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete a unit
  deleteUnit: async (unitId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete unit');
      
      set(state => ({
        units: state.units.filter(u => u._id !== unitId),
        currentUnit: state.currentUnit?._id === unitId ? null : state.currentUnit
      }));
      
      toast.success('Unit deleted successfully', { duration: 3000 });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to delete unit', { duration: 3000 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Set current unit
  setCurrentUnit: (unit) => {
    set({ currentUnit: unit });
  },

  // Clear current unit
  clearCurrentUnit: () => {
    set({ currentUnit: null });
  },

  // Clear all units from store
  clearUnits: () => {
    set({ units: [], currentUnit: null, error: null });
  },
}));

export default useUnitStore;

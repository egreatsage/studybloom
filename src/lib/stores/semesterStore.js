'use client';

import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useSemesterStore = create((set) => ({
  semesters: [],
  loading: false,
  error: null,

  fetchSemesters: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/semesters');
      if (!res.ok) throw new Error('Failed to fetch semesters');
      const data = await res.json();
      set({ semesters: data.semesters || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to fetch semesters: ${error.message}`, { duration: 1500 });
    }
  },

  addSemester: async (semesterData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semesterData),
      });
      if (!res.ok) throw new Error('Failed to add semester');
      const data = await res.json();
      set((state) => ({
        semesters: [...state.semesters, data.semester],
        loading: false,
      }));
      toast.success('Semester added successfully', { duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to add semester: ${error.message}`, { duration: 2000 });
    }
  },

  editSemester: async (id, semesterData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semesterData),
      });
      if (!res.ok) throw new Error('Failed to update semester');
      const data = await res.json();
      set((state) => ({
        semesters: state.semesters.map((sem) =>
          sem._id === id ? data.semester : sem
        ),
        loading: false,
      }));
      toast.success('Semester updated successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to update semester: ${error.message}`, { duration: 1500 });
    }
  },

  deleteSemester: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete semester');
      set((state) => ({
        semesters: state.semesters.filter((sem) => sem._id !== id),
        loading: false,
      }));
      toast.success('Semester deleted successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to delete semester: ${error.message}`, { duration: 1500 });
    }
  },

  // Add courses to a semester
  addCoursesToSemester: async (semesterId, courseIds) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${semesterId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      });
      if (!res.ok) throw new Error('Failed to add courses to semester');
      const data = await res.json();
      set((state) => ({
        semesters: state.semesters.map((sem) =>
          sem._id === semesterId ? data.semester : sem
        ),
        loading: false,
      }));
      toast.success('Courses added to semester successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to add courses: ${error.message}`, { duration: 1500 });
    }
  },

  // Remove courses from a semester
  removeCoursesFromSemester: async (semesterId, courseIds) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${semesterId}/courses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      });
      if (!res.ok) throw new Error('Failed to remove courses from semester');
      const data = await res.json();
      set((state) => ({
        semesters: state.semesters.map((sem) =>
          sem._id === semesterId ? data.semester : sem
        ),
        loading: false,
      }));
      toast.success('Courses removed from semester successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to remove courses: ${error.message}`, { duration: 1500 });
    }
  },

  // Add units to a semester
  addUnitsToSemester: async (semesterId, unitIds) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${semesterId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitIds }),
      });
      if (!res.ok) throw new Error('Failed to add units to semester');
      const data = await res.json();
      set((state) => ({
        semesters: state.semesters.map((sem) =>
          sem._id === semesterId ? data.semester : sem
        ),
        loading: false,
      }));
      toast.success('Units added to semester successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to add units: ${error.message}`, { duration: 1500 });
    }
  },

  // Remove units from a semester
  removeUnitsFromSemester: async (semesterId, unitIds) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/semesters/${semesterId}/units`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitIds }),
      });
      if (!res.ok) throw new Error('Failed to remove units from semester');
      const data = await res.json();
      set((state) => ({
        semesters: state.semesters.map((sem) =>
          sem._id === semesterId ? data.semester : sem
        ),
        loading: false,
      }));
      toast.success('Units removed from semester successfully', { duration: 1500 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to remove units: ${error.message}`, { duration: 1500 });
    }
  },
}));

export default useSemesterStore;

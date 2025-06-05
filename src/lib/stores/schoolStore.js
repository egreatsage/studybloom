import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useSchoolStore = create((set) => ({
  schools: [],
  loading: false,
  error: null,

  fetchSchools: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/schools');
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      set({ schools: data.schools || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to fetch schools: ${error.message}`, { duration: 2000 });
    }
  },

  addSchool: async (schoolData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add school');
      }
      const data = await res.json();
      set((state) => ({
        schools: [data.school, ...state.schools],
        loading: false,
      }));
      toast.success('School added successfully', { duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to add school: ${error.message}`, { duration: 2000 });
    }
  },

  updateSchool: async (id, schoolData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/schools?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update school');
      }
      const data = await res.json();
      set((state) => ({
        schools: state.schools.map((school) =>
          school._id === id ? data.school : school
        ),
        loading: false,
      }));
      toast.success('School updated successfully', { duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to update school: ${error.message}`, { duration: 2000 });
    }
  },

  deleteSchool: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/schools?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete school');
      }
      set((state) => ({
        schools: state.schools.filter((school) => school._id !== id),
        loading: false,
      }));
      toast.success('School deleted successfully', { duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to delete school: ${error.message}`, { duration: 2000 });
    }
  },
}));

export default useSchoolStore;

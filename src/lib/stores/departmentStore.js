import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useDepartmentStore = create((set) => ({
  departments: [],
  loading: false,
  error: null,

  fetchDepartments: async ({ schoolId } = {}) => {
    set({ loading: true, error: null });
    try {
      const url = schoolId ? `/api/departments?schoolId=${schoolId}` : '/api/departments';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      set({ departments: data.departments || [], loading: false });
      if (data.departments?.length === 0) {
        toast('No departments found', { icon: 'ℹ️', duration: 2000 });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to fetch departments: ${error.message}`, { icon: '❌', duration: 2000 });
    }
  },

  addDepartment: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add department');
      const data = await res.json();
      set((state) => ({
        departments: [...state.departments, data.department],
        loading: false,
      }));
      toast('Department added successfully', { icon: '✅', duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to add department: ${error.message}`, { icon: '❌', duration: 2000 });
    }
  },

  editDepartment: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to edit department');
      const data = await res.json();
      set((state) => ({
        departments: state.departments.map((dept) =>
          dept._id === id ? data.department : dept
        ),
        loading: false,
      }));
      toast('Department updated successfully', { icon: '✅', duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to edit department: ${error.message}`, { icon: '❌', duration: 2000 });
    }
  },

  deleteDepartment: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete department');
      set((state) => ({
        departments: state.departments.filter((dept) => dept._id !== id),
        loading: false,
      }));
      toast('Department deleted successfully', { icon: '✅', duration: 2000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to delete department: ${error.message}`, { icon: '❌', duration: 2000 });
    }
  },
}));

export default useDepartmentStore;

import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useCourseStore = create((set) => ({
  courses: [],
  loading: false,
  error: null,

  fetchCourses: async ({ departmentId } = {}) => {
    set({ loading: true, error: null });
    try {
      const url = departmentId ? `/api/courses?departmentId=${departmentId}` : '/api/courses';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      set({ courses: data.courses || [], loading: false });
      if (data.courses?.length === 0) {
        toast('No courses found', { icon: 'ℹ️' });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to fetch courses: ${error.message}`, { icon: '❌' });
    }
  },

  fetchDepartmentsBySchool: async (schoolId) => {
    try {
      const res = await fetch(`/api/departments?schoolId=${schoolId}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      return data.departments || [];
    } catch (error) {
      toast(`Failed to fetch departments: ${error.message}`, { icon: '❌' });
      return [];
    }
  },

  addCourse: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add course');
      const data = await res.json();
      set((state) => ({
        courses: [...state.courses, data.course],
        loading: false,
      }));
      toast('Course added successfully', { icon: '✅' });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to add course: ${error.message}`, { icon: '❌' });
    }
  },

  editCourse: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/courses?id=${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to edit course');
      const data = await res.json();
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === id ? data.course : course
        ),
        loading: false,
      }));
      toast('Course updated successfully', { icon: '✅' });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to edit course: ${error.message}`, { icon: '❌' });
    }
  },

  deleteCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/courses?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete course');
      set((state) => ({
        courses: state.courses.filter((course) => course._id !== id),
        loading: false,
      }));
      toast('Course deleted successfully', { icon: '✅' });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to delete course: ${error.message}`, { icon: '❌' });
    }
  },
}));

export default useCourseStore;

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
      // Ensure courses are populated with school and department
      const courses = Array.isArray(data) ? data : data.courses || [];
      set({ courses, loading: false });
      if (data.courses?.length === 0) {
        toast('No courses found', { icon: 'ℹ️', duration: 3000 });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to fetch courses: ${error.message}`, { icon: '❌', duration: 3000 });
    }
  },

  fetchDepartmentsBySchool: async (schoolId) => {
    try {
      const res = await fetch(`/api/departments?schoolId=${schoolId}`);
      if (!res.ok) console.log('Failed to fetch departments');
      const data = await res.json();
      return data.departments || [];
    } catch (error) {
      console.log(`Failed to fetch departments: ${error.message}`, { icon: '❌' });
      return [];
    }
  },

  addCourse: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Convert FormData to plain object
      const obj = {};
      formData.forEach((value, key) => {
        obj[key] = value;
      });
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });
      if (!res.ok) throw new Error('Failed to add course');
      const newCourse = await res.json();
      set((state) => ({
        courses: [...state.courses, newCourse],
        loading: false,
      }));
      toast('Course added successfully', { icon: '✅', duration: 3000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to add course: ${error.message}`, { icon: '❌', duration: 3000 });
    }
  },

  editCourse: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      // Convert FormData to plain object and include the ID
      const obj = { id };
      formData.forEach((value, key) => {
        obj[key] = value;
      });
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to edit course');
      }
      const updatedCourse = await res.json();
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === id ? updatedCourse : course
        ),
        loading: false,
      }));
      toast('Course updated successfully', { icon: '✅', duration: 3000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to edit course: ${error.message}`, { icon: '❌', duration: 3000 });
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
      toast('Course deleted successfully', { icon: '✅', duration: 3000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast(`Failed to delete course: ${error.message}`, { icon: '❌', duration: 3000 });
    }
  },
}));

export default useCourseStore;

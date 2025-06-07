import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const users = Array.isArray(data) ? data : [];
      
      set({ users, loading: false });
      if (users.length === 0) {
         toast('No user found', { icon: 'ℹ️' });
      } 
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Fetch users failed: ${error.message}`, { duration: 3000 });
    }
  },

  addUser: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add user');
      const data = await res.json();
      set((state) => ({ users: [...state.users, data], loading: false }));
      toast('success, user added !', { icon: 'ℹ️' });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Add user failed: ${error.message}`, { duration: 3000 });
    }
  },

  editUser: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to edit user');
      const data = await res.json();
      set((state) => ({
        users: state.users.map((user) => (user._id === id ? data : user)),
        loading: false,
      }));
      toast.success('User updated successfully', { duration: 3000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Edit user failed: ${error.message}`, { duration: 3000 });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      set((state) => ({
        users: state.users.filter((user) => user._id !== id),
        loading: false,
      }));
      toast.success('User deleted successfully', { duration: 3000 });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Delete user failed: ${error.message}`, { duration: 3000 });
    }
  },
}));

export default useUserStore;

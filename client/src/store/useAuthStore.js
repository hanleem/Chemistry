import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,            // { id, student_id, name, role } or null
  loading: true,         // initial /me check
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = await api.me();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (student_id, password) => {
    set({ error: null });
    const { user } = await api.login({ student_id, password });
    set({ user });
    return user;
  },

  register: async (student_id, name, password) => {
    set({ error: null });
    const { user } = await api.register({ student_id, name, password });
    set({ user });
    return user;
  },

  logout: async () => {
    try { await api.logout(); } catch {}
    set({ user: null });
  },
}));

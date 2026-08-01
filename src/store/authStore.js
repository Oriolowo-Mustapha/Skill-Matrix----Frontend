import { create } from 'zustand';

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getStorage = () => {
  const remembered = localStorage.getItem('matrix_remember');
  return remembered === 'true' ? localStorage : sessionStorage;
};

const loadStoredUser = () => {
  const storage = getStorage();
  const raw = storage.getItem('matrix_user');
  if (!raw) return null;
  return safeJsonParse(raw);
};

const loadStoredToken = () => {
  const storage = getStorage();
  return storage.getItem('matrix_token');
};

const useAuthStore = create((set, get) => ({
  user: loadStoredUser(),
  token: loadStoredToken(),
  isAuthenticated: !!loadStoredToken(),

  setAuth: (user, token, rememberMe = true) => {
    localStorage.setItem('matrix_remember', rememberMe ? 'true' : 'false');
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    if (token) storage.setItem('matrix_token', token);
    else storage.removeItem('matrix_token');

    if (user) storage.setItem('matrix_user', JSON.stringify(user));
    else storage.removeItem('matrix_user');

    // Clean up the other storage
    otherStorage.removeItem('matrix_token');
    otherStorage.removeItem('matrix_user');

    set({
      user: user ?? null,
      token: token ?? null,
      isAuthenticated: !!token,
    });
  },

  logout: () => {
    localStorage.removeItem('matrix_token');
    localStorage.removeItem('matrix_user');
    localStorage.removeItem('matrix_remember');
    sessionStorage.removeItem('matrix_token');
    sessionStorage.removeItem('matrix_user');

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('skill_matrix_active_assessment')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore storage cleanup error
    }

    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    const storage = getStorage();
    if (user) storage.setItem('matrix_user', JSON.stringify(user));
    else storage.removeItem('matrix_user');
    set({ user: user ?? null });
  },

  updateUser: (data) =>
    set((state) => {
      const nextUser = { ...(state.user || {}), ...(data || {}) };
      const storage = getStorage();
      storage.setItem('matrix_user', JSON.stringify(nextUser));
      return { user: nextUser };
    }),
}));

export default useAuthStore;

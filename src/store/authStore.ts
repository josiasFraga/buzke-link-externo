import { create } from 'zustand';
import { User } from '../types';

function isBrowser() {
  return typeof window !== 'undefined';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadToken: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token: string) => {
    if (isBrowser()) {
      sessionStorage.setItem('authToken', token);
    }

    set({ token, isAuthenticated: true });
  },
  setUser: (user: User) => {
    set({ user });
  },
  logout: () => {
    if (isBrowser()) {
      sessionStorage.removeItem('authToken');
    }

    set({ token: null, user: null, isAuthenticated: false });
  },
  loadToken: () => {
    if (!isBrowser()) {
      return;
    }

    const token = sessionStorage.getItem('authToken');

    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));

// Carrega o token da sessão quando a aplicação inicia
if (isBrowser()) {
  useAuthStore.getState().loadToken();
}

export default useAuthStore;
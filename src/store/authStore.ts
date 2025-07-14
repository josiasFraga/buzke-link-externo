import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadToken: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token: string) => {
    sessionStorage.setItem('authToken', token);
    set({ token, isAuthenticated: true });
  },
  setUser: (user: User) => {
    set({ user });
  },
  logout: () => {
    sessionStorage.removeItem('authToken');
    set({ token: null, user: null, isAuthenticated: false });
  },
  loadToken: () => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));

// Carrega o token da sessão quando a aplicação inicia
useAuthStore.getState().loadToken();

export default useAuthStore;
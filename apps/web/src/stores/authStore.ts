import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
}

interface Subscription {
  plan: string;
  status: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  subscription: Subscription | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (data: { user: User; organization: Organization; subscription: Subscription; token: string }) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      subscription: null,
      token: null,
      isAuthenticated: false,

      setAuth: ({ user, organization, subscription, token }) => {
        localStorage.setItem('token', token);
        set({
          user,
          organization,
          subscription,
          token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          organization: null,
          subscription: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEMO_USER = {
  id: 1,
  firstName: 'Demo',
  lastName: 'Student',
  email: 'demo@egram.com',
  roles: ['STUDENT', 'ADMIN', 'MENTOR'],
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: DEMO_USER,
      token: 'demo-presentation-token',
      refreshToken: null,
      isAuthenticated: true,

      setAuth: ({ user, accessToken, refreshToken }) => {
        localStorage.setItem('egram_token', accessToken)
        set({ user, token: accessToken, refreshToken, isAuthenticated: true })
      },

      // PRESENTATION MODE: logout just resets back to Demo user
      logout: () => {
        set({
          user: DEMO_USER,
          token: 'demo-presentation-token',
          refreshToken: null,
          isAuthenticated: true,
        })
      },

      hasRole: (role) => {
        const roles = get().user?.roles || []
        return roles.includes(role)
      },

      isAdmin: () => get().hasRole('ADMIN'),
      isMentor: () => get().hasRole('MENTOR') || get().hasRole('VERIFIED_CREATOR'),
      isStudent: () => get().hasRole('STUDENT'),
    }),
    {
      name: 'egram-auth-presentation',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

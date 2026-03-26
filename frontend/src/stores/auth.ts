import { defineStore } from 'pinia'
import api from '../services/api'

interface AuthState {
  token: string | null
  uid: string | null
  expiresAt: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    uid: localStorage.getItem('uid'),
    expiresAt: localStorage.getItem('expiresAt'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userId: (state) => state.uid,
  },
  actions: {
    async login({ username, password, loginType }: { username: string; password: string; loginType: string }) {
      const { data } = await api.post('/auth/login', { username, password, loginType })
      this.token = data.token
      this.uid = data.uid
      this.expiresAt = data.expiresAt
      localStorage.setItem('token', this.token!)
      localStorage.setItem('uid', this.uid!)
      localStorage.setItem('expiresAt', this.expiresAt!)
    },
    logout() {
      this.token = null
      this.uid = null
      this.expiresAt = null
      localStorage.removeItem('token')
      localStorage.removeItem('uid')
      localStorage.removeItem('expiresAt')
    }
  }
})


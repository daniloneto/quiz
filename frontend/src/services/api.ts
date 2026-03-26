import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const isDev = import.meta.env.DEV
const baseURL = isDev
  ? '/api/v1'
  : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1`

const api = axios.create({ baseURL, timeout: 20000 })

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const apiKey = import.meta.env.VITE_API_KEY
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  if (auth?.token) {
    config.headers['Authorization'] = `Bearer ${auth.token}`
  }
  return config
})

export default api

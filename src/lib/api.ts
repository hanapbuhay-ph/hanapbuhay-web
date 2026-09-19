import axios from 'axios'

import { clearToken, getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const isPublicAuthRequest = (url?: string) => {
  if (!url) {
    return false
  }

  return [
    '/auth/login',
    '/auth/google',
    '/auth/register',
    '/auth/email',
    '/auth/password',
  ].some((prefix) => url.includes(prefix))
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url

    if (status === 401 && !isPublicAuthRequest(requestUrl)) {
      clearToken()
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

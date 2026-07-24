import axios from 'axios'

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

/**
 * Axios instance untuk Admin & Auth API Laravel
 * Base URL: http://<host>:8000
 */
const api = axios.create({
  baseURL: `http://${host}:8000`,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 15000,
})

/**
 * Axios instance untuk Gateway Proxy (API Tester)
 * Base URL: http://<host>:8000/gateway
 */
export const gatewayApi = axios.create({
  baseURL: `http://${host}:8000/gateway`,
  timeout: 30000,
})

// ─── Request Interceptor ─────────────────────────────────────────────────
// Baca token dari localStorage dan inject ke header Authorization
// secara otomatis pada setiap request keluar.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gkp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────
// Unwrap error message dan tangani 401 (token tidak valid / expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus data auth lokal dan redirect ke halaman login
      localStorage.removeItem('gkp_token')
      localStorage.removeItem('gkp_user')
      window.location.href = '/login'
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan koneksi ke server.'
    return Promise.reject({ ...error, userMessage: message })
  }
)

export default api

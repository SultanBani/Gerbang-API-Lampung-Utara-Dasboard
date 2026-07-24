import axios from 'axios'

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

/**
 * Axios instance untuk Admin API Laravel
 * Base URL: http://<host>:8000/api/admin
 */
const api = axios.create({
  baseURL: `http://${host}:8000/api/admin`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

// Response interceptor — unwrap data.data dari envelope { success, message, data }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan koneksi ke server.'
    return Promise.reject({ ...error, userMessage: message })
  }
)

export default api

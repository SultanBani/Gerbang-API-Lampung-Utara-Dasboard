import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gkp_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gkp_token') || null
  })

  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Auto setup Axios default auth header if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('gkp_token', token)
    } else {
      localStorage.removeItem('gkp_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('gkp_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('gkp_user')
    }
  }, [user])

  const login = useCallback(async (loginInput, password) => {
    setLoading(true)
    setAuthError(null)
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const response = await axios.post(`http://${host}:8000/api/auth/login`, {
        login: loginInput,
        password: password,
      })

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data
        setToken(authToken)
        setUser(userData)
        return userData
      } else {
        throw new Error(response.data.message || 'Login gagal.')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Gagal terhubung ke server backend.'
      setAuthError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('gkp_user')
    localStorage.removeItem('gkp_token')
  }, [])

  const isAdmin = user?.role === 'admin'
  const isDinas = user?.role === 'dinas'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        logout,
        isAdmin,
        isDinas,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

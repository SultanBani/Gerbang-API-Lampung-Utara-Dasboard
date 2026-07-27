import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const ApiGatewayContext = createContext()

export function ApiGatewayProvider({ children }) {
  // ── State Utama ────────────────────────────────────────────────────
  const [stats, setStats]               = useState(null)
  const [opds, setOpds]                 = useState([])
  const [endpoints, setEndpoints]       = useState([])
  const [accessControls, setAccessControls] = useState({ applications: [], endpoints: [], matrix: {} })
  const [logs, setLogs]                 = useState({ data: [], meta: {} })
  const [users, setUsers]               = useState([])

  // ── Loading & Error per-resource ──────────────────────────────────
  const [loading, setLoading] = useState({
    stats: false, opds: false, endpoints: false,
    accessControls: false, logs: false, action: false, users: false,
  })
  const [error, setError] = useState(null)

  const setRes = (key, val) => setLoading(prev => ({ ...prev, [key]: val }))

  // ─────────────────────────────────────────────────────────────────
  // FETCH FUNCTIONS
  // ─────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setRes('stats', true)
    try {
      const res = await api.get('/api/admin/stats')
      setStats(res.data.data)
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('stats', false)
    }
  }, [])

  const fetchOpds = useCallback(async (params = {}) => {
    setRes('opds', true)
    try {
      const res = await api.get('/api/admin/opds', { params: { per_page: 50, ...params } })
      const items = res.data.data?.data ?? res.data.data ?? []
      setOpds(items)
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('opds', false)
    }
  }, [])

  const fetchEndpoints = useCallback(async (params = {}) => {
    setRes('endpoints', true)
    try {
      const res = await api.get('/api/admin/endpoints', { params: { per_page: 100, ...params } })
      setEndpoints(res.data.data?.data ?? res.data.data ?? [])
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('endpoints', false)
    }
  }, [])

  const fetchAccessControls = useCallback(async () => {
    setRes('accessControls', true)
    try {
      const res = await api.get('/api/admin/access-controls')
      setAccessControls(res.data.data)
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('accessControls', false)
    }
  }, [])

  const fetchLogs = useCallback(async (params = {}) => {
    setRes('logs', true)
    try {
      const res = await api.get('/api/admin/logs', { params: { per_page: 15, ...params } })
      setLogs(res.data.data)
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('logs', false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setRes('users', true)
    try {
      const res = await api.get('/api/admin/users')
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('users', false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────
  // CRUD ACTIONS — OPDs (menggantikan Applications)
  // ─────────────────────────────────────────────────────────────────

  const createOpd = useCallback(async (formData) => {
    setRes('action', true)
    try {
      const payload = {
        name:        formData.name,
        code:        formData.code,
        description: formData.description || null,
      }
      const res = await api.post('/api/admin/opds', payload)
      await fetchOpds()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchOpds])

  const updateOpd = useCallback(async (id, formData) => {
    setRes('action', true)
    try {
      const res = await api.put(`/api/admin/opds/${id}`, formData)
      await fetchOpds()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchOpds])

  const deleteOpd = useCallback(async (id) => {
    setRes('action', true)
    try {
      await api.delete(`/api/admin/opds/${id}`)
      setOpds(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────
  // CRUD ACTIONS — Endpoints
  // ─────────────────────────────────────────────────────────────────

  const createEndpoint = useCallback(async (formData) => {
    setRes('action', true)
    try {
      const payload = {
        opd_id:             formData.opd_id,
        title:              formData.title,
        slug:               formData.slug,
        target_url:         formData.target_url,
        method_permissions: formData.method_permissions,
        is_active:          formData.is_active ?? true,
      }
      const res = await api.post('/api/admin/endpoints', payload)
      await fetchEndpoints()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchEndpoints])

  const updateEndpoint = useCallback(async (id, formData) => {
    setRes('action', true)
    try {
      const res = await api.put(`/api/admin/endpoints/${id}`, formData)
      await fetchEndpoints()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchEndpoints])

  const deleteEndpoint = useCallback(async (id) => {
    setRes('action', true)
    try {
      await api.delete(`/api/admin/endpoints/${id}`)
      setEndpoints(prev => prev.filter(e => e.id !== id))
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────
  // ACCESS CONTROL ACTIONS
  // ─────────────────────────────────────────────────────────────────

  const toggleAccess = useCallback(async (appId, endpointId) => {
    // Optimistic UI update
    const key = `${appId}:${endpointId}`
    setAccessControls(prev => {
      const current = prev.matrix?.[key]
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [key]: {
            id:         current?.id ?? null,
            is_allowed: !(current?.is_allowed ?? false),
          },
        },
      }
    })

    try {
      const res = await api.post('/api/admin/access-controls/toggle', {
        application_id: appId,
        endpoint_id:    endpointId,
      })
      // Sync actual value dari server
      setAccessControls(prev => ({
        ...prev,
        matrix: {
          ...prev.matrix,
          [key]: {
            id:         res.data.data.id,
            is_allowed: res.data.data.is_allowed,
          },
        },
      }))
    } catch (e) {
      // Rollback on error
      await fetchAccessControls()
      setError(e.userMessage)
    }
  }, [fetchAccessControls])

  // ─────────────────────────────────────────────────────────────────
  // USER MANAGEMENT ACTIONS
  // ─────────────────────────────────────────────────────────────────

  const createUser = useCallback(async (formData) => {
    setRes('action', true)
    try {
      const res = await api.post('/api/admin/users', formData)
      await fetchUsers()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchUsers])

  const deleteUser = useCallback(async (id) => {
    setRes('action', true)
    try {
      await api.delete(`/api/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [])

  return (
    <ApiGatewayContext.Provider
      value={{
        // State
        stats,
        opds,
        applications: opds, // Legacy compat alias
        endpoints,
        accessControls,
        logs,
        users,
        loading,
        error,

        // Fetch
        fetchStats,
        fetchOpds,
        fetchApplications: fetchOpds, // Legacy compat alias
        fetchEndpoints,
        fetchAccessControls,
        fetchLogs,
        fetchUsers,

        // OPD actions
        createOpd,
        updateOpd,
        deleteOpd,

        // Endpoint actions
        createEndpoint,
        updateEndpoint,
        deleteEndpoint,

        // Access control
        toggleAccess,

        // User management
        createUser,
        deleteUser,
      }}
    >
      {children}
    </ApiGatewayContext.Provider>
  )
}

export function useApiGateway() {
  return useContext(ApiGatewayContext)
}

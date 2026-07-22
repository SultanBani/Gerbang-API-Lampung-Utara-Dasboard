import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const ApiGatewayContext = createContext()

export function ApiGatewayProvider({ children }) {
  // ── State Utama ────────────────────────────────────────────────────
  const [stats, setStats]               = useState(null)
  const [applications, setApplications] = useState([])
  const [endpoints, setEndpoints]       = useState([])
  const [accessControls, setAccessControls] = useState({ applications: [], endpoints: [], matrix: {} })
  const [logs, setLogs]                 = useState({ data: [], meta: {} })
  const [apiKeys, setApiKeys]           = useState([])

  // ── Loading & Error per-resource ──────────────────────────────────
  const [loading, setLoading] = useState({
    stats: false, applications: false, endpoints: false,
    accessControls: false, logs: false, action: false,
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

  const fetchApplications = useCallback(async (params = {}) => {
    setRes('applications', true)
    try {
      const res = await api.get('/api/admin/applications', { params: { per_page: 50, ...params } })
      const items = res.data.data?.data ?? res.data.data ?? []
      setApplications(items)
      // Flatten API keys dari nested aplikasi
      const keys = items.flatMap(app =>
        (app.api_keys ?? []).map(k => ({
          ...k,
          appId:   app.id,
          appName: app.name,
          opd:     app.opd,
        }))
      )
      setApiKeys(keys)
    } catch (e) {
      setError(e.userMessage)
    } finally {
      setRes('applications', false)
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

  // ─────────────────────────────────────────────────────────────────
  // CRUD ACTIONS — Applications
  // ─────────────────────────────────────────────────────────────────

  const createApplication = useCallback(async (formData) => {
    setRes('action', true)
    try {
      const payload = {
        name:        formData.name,
        opd:         formData.opd,
        pic_name:    formData.pic || formData.pic_name,
        pic_phone:   formData.phone || formData.pic_phone || null,
        description: formData.description || null,
        status:      formData.status || 'active',
      }
      const res = await api.post('/api/admin/applications', payload)
      await fetchApplications()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchApplications])

  const updateApplication = useCallback(async (id, formData) => {
    setRes('action', true)
    try {
      const res = await api.put(`/api/admin/applications/${id}`, formData)
      await fetchApplications()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchApplications])

  const deleteApplication = useCallback(async (id) => {
    setRes('action', true)
    try {
      await api.delete(`/api/admin/applications/${id}`)
      setApplications(prev => prev.filter(a => a.id !== id))
      setApiKeys(prev => prev.filter(k => k.appId !== id))
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [])

  const generateNewKey = useCallback(async (appId) => {
    setRes('action', true)
    try {
      const res = await api.post(`/api/admin/applications/${appId}/generate-key`)
      await fetchApplications()
      return res.data
    } catch (e) {
      setError(e.userMessage)
      throw e
    } finally {
      setRes('action', false)
    }
  }, [fetchApplications])

  // ─────────────────────────────────────────────────────────────────
  // CRUD ACTIONS — Endpoints
  // ─────────────────────────────────────────────────────────────────

  const createEndpoint = useCallback(async (formData) => {
    setRes('action', true)
    try {
      const payload = {
        method:           formData.method,
        url:              formData.url,
        description:      formData.description || null,
        tag:              formData.tag || 'Umum',
        is_auth_required: formData.isAuthRequired ?? true,
        rate_limit:       Number(formData.rateLimit) || 60,
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
  // LEGACY COMPAT — API Key revoke (hanya ubah lokal, generate yang baru pakai generateNewKey)
  // ─────────────────────────────────────────────────────────────────

  const revokeKey = useCallback(async (appId) => {
    // Tidak ada endpoint revoke terpisah; untuk revoke gunakan generate-key
    // yang otomatis merevoke key lama. Di sini kita update UI saja.
    setApiKeys(prev =>
      prev.map(k => k.appId === appId ? { ...k, status: 'revoked' } : k)
    )
  }, [])

  return (
    <ApiGatewayContext.Provider
      value={{
        // State
        stats,
        applications,
        endpoints,
        accessControls,
        logs,
        apiKeys,
        loading,
        error,

        // Fetch
        fetchStats,
        fetchApplications,
        fetchEndpoints,
        fetchAccessControls,
        fetchLogs,

        // Application actions
        createApplication,
        updateApplication,
        deleteApplication,
        generateNewKey,

        // Endpoint actions
        createEndpoint,
        deleteEndpoint,

        // Access control
        toggleAccess,

        // Legacy compat
        revokeKey,
        addApplication: createApplication,
        addEndpoint:    createEndpoint,
      }}
    >
      {children}
    </ApiGatewayContext.Provider>
  )
}

export function useApiGateway() {
  return useContext(ApiGatewayContext)
}

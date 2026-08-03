import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import api, { gatewayApi } from '../services/api'
import {
  Send, Loader2, Plus, Trash2, Copy, Check,
  FolderOpen, Code2, Sparkles, ShieldCheck,
  Clock, FileJson, Key, Sliders, Play, Search, AlertCircle
} from 'lucide-react'

// Color badges for HTTP Methods
const METHOD_COLORS = {
  GET:    { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  POST:   { bg: 'bg-blue-500/10 dark:bg-blue-500/20',       text: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-500/30' },
  PUT:    { bg: 'bg-amber-500/10 dark:bg-amber-500/20',     text: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-500/30' },
  PATCH:  { bg: 'bg-purple-500/10 dark:bg-purple-500/20',   text: 'text-purple-600 dark:text-purple-400',   border: 'border-purple-500/30' },
  DELETE: { bg: 'bg-red-500/10 dark:bg-red-500/20',         text: 'text-red-600 dark:text-red-400',         border: 'border-red-500/30' },
}

// Preset Collection Endpoints (Lampung Utara Gateway API - Fallback)
const PRESET_COLLECTIONS = [
  {
    category: 'Keuangan (BPKAD)',
    items: [
      {
        name: 'PAD Lampung Utara (2023-2024)',
        method: 'GET',
        url: '/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara',
        desc: 'Dataset PAD Resmi Lampung Utara dalam format CSV/JSON',
        params: [],
        headers: [],
        body: ''
      },
      {
        name: 'Realisasi APBD Daerah',
        method: 'GET',
        url: '/keuangan/apbd',
        desc: 'Data realisasi pendapatan & belanja APBD Lampura',
        params: [],
        headers: [],
        body: ''
      }
    ]
  },
  {
    category: 'Kependudukan (Dukcapil)',
    items: [
      {
        name: 'Validasi NIK Penduduk',
        method: 'GET',
        url: '/dukcapil/penduduk',
        desc: 'Verifikasi status kependudukan warga berbasis NIK',
        params: [{ key: 'nik', value: '1803011508900001', active: true }],
        headers: [],
        body: ''
      },
      {
        name: 'Pencarian Data Kartu Keluarga',
        method: 'GET',
        url: '/dukcapil/keluarga',
        desc: 'Pencarian data KK kependudukan',
        params: [],
        headers: [],
        body: ''
      }
    ]
  },
  {
    category: 'Kepegawaian (BKD)',
    items: [
      {
        name: 'Profil ASN / Pegawai',
        method: 'GET',
        url: '/kepegawaian/v1/data',
        desc: 'Data profil kepegawaian ASN berbasis NIP',
        params: [{ key: 'nip', value: '198506122010011005', active: true }],
        headers: [],
        body: ''
      }
    ]
  },
  {
    category: 'Perencanaan (Bappeda)',
    items: [
      {
        name: 'Program Kerja RKPD',
        method: 'GET',
        url: '/perencanaan/program',
        desc: 'Daftar program unggulan pembangunan daerah 2026',
        params: [],
        headers: [],
        body: ''
      }
    ]
  }
]

export default function ApiTesterPage() {
  const context = useApiGateway() || {}
  const opds = context.opds || []
  const endpoints = context.endpoints || []
  const fetchOpds = context.fetchOpds || (() => {})
  const fetchEndpoints = context.fetchEndpoints || (() => {})

  // Catalog Endpoints from backend API
  const [catalogEndpoints, setCatalogEndpoints] = useState([])

  useEffect(() => {
    api.get('/api/opd/catalog')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setCatalogEndpoints(res.data.data)
        }
      })
      .catch(err => console.error('Gagal memuat katalog API:', err))
  }, [])

  // Build dynamic collections grouped by OPD
  const dynamicCollections = useMemo(() => {
    if (!catalogEndpoints || catalogEndpoints.length === 0) {
      return PRESET_COLLECTIONS
    }

    const groups = {}
    catalogEndpoints.forEach(item => {
      const category = item.opd_name || item.opd?.name || 'OPD Terdaftar'
      if (!groups[category]) {
        groups[category] = []
      }

      let rawMethods = ['GET']
      if (Array.isArray(item.method_permissions)) {
        rawMethods = item.method_permissions
      } else if (typeof item.method_permissions === 'string') {
        try { rawMethods = JSON.parse(item.method_permissions) } catch { rawMethods = ['GET'] }
      }

      const methods = rawMethods && rawMethods.length > 0 ? rawMethods : ['GET']
      const formattedSlug = item.slug ? (item.slug.startsWith('/') ? item.slug : `/${item.slug}`) : `/${item.id}`

      methods.forEach(m => {
        const apiKey = item.user_api_key || item.api_key || ''
        groups[category].push({
          id: `${item.id}-${m}`,
          name: item.title,
          method: m,
          url: formattedSlug,
          desc: item.target_url || item.description || `Endpoint ${item.title}`,
          apiKey: apiKey,
          params: [],
          headers: apiKey ? [{ key: 'X-API-KEY', value: apiKey, active: true }] : [],
          body: ''
        })
      })
    })

    return Object.keys(groups).map(cat => ({
      category: cat,
      items: groups[cat]
    }))
  }, [catalogEndpoints])

  // App Selection for Auto API Key
  const [selectedAppId, setSelectedAppId] = useState('')

  // Generate dynamic API Keys array from opds list safely
  const apiKeys = useMemo(() => {
    if (!opds || opds.length === 0) {
      return [
        { id: 1, appId: 1, application_id: 1, appName: 'SIPKD Keuangan BPKAD', opd: 'bpkad', key: 'gkp_bappeda_key_2026_x89a', status: 'active' },
        { id: 2, appId: 2, application_id: 2, appName: 'SIAK Integrasi Dukcapil', opd: 'disdukcapil', key: 'gkp_disdukcapil_key_2026_a1b2', status: 'active' }
      ]
    }
    return applications.map((app, idx) => ({
      id: app.id || idx + 1,
      appId: app.id || idx + 1,
      application_id: app.id || idx + 1,
      appName: app.name || `Aplikasi OPD #${idx + 1}`,
      opd: app.code || 'opd',
      key: `gkp_${(app.code || 'opd').toLowerCase()}_key_2026_x89a`,
      status: 'active'
    }))
  }, [opds])

  // Request State
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestUrl, setRequestUrl]       = useState('/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara')
  const [activeReqTab, setActiveReqTab]   = useState('params') // 'params' | 'headers' | 'auth' | 'body'

  // Dynamic Query Params Table
  const [queryParams, setQueryParams]     = useState([
    { key: 'page', value: '1', active: true },
    { key: 'per_page', value: '10', active: true }
  ])

  // Custom Headers Table
  const [customHeaders, setCustomHeaders] = useState([])

  // JSON Body Editor
  const [requestBody, setRequestBody]     = useState('')

  // Execution & Response State
  const [loading, setLoading]             = useState(false)
  const [responseResult, setResponseResult] = useState(null)
  const [responseError, setResponseError]   = useState(null)
  const [activeResTab, setActiveResTab]   = useState('pretty') // 'pretty' | 'raw' | 'headers'
  const [copied, setCopied]               = useState(false)

  // Sidebar / History Tabs
  const [activeSidebarTab, setActiveSidebarTab] = useState('collections') // 'collections' | 'history'
  const [requestHistory, setRequestHistory]     = useState([])
  const [searchFilter, setSearchFilter]         = useState('')

  useEffect(() => {
    if (opds.length === 0 && fetchOpds) fetchOpds()
    if (endpoints.length === 0 && fetchEndpoints) fetchEndpoints()
  }, [opds.length, endpoints.length, fetchOpds, fetchEndpoints])

  // Auto-select first active API key
  useEffect(() => {
    if (apiKeys.length > 0 && !selectedAppId) {
      setSelectedAppId(String(apiKeys[0].appId))
    }
  }, [apiKeys, selectedAppId])

  // Get current active key object
  const currentKey = useMemo(() => {
    const id = Number(selectedAppId)
    return apiKeys.find(k => k.appId === id || k.id === id) || apiKeys[0] || { appId: 1, key: 'gkp_bappeda_key_2026_x89a' }
  }, [apiKeys, selectedAppId])

  // Construct full target URL including active query parameters
  const fullTargetUrl = useMemo(() => {
    const activeParams = queryParams.filter(p => p.active && p.key.trim())
    if (activeParams.length === 0) return requestUrl

    const queryString = activeParams
      .map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
      .join('&')

    return requestUrl.includes('?') ? `${requestUrl}&${queryString}` : `${requestUrl}?${queryString}`
  }, [requestUrl, queryParams])

  // Core API Request Execution Engine
  const executeSend = async (method = requestMethod, url = requestUrl, params = queryParams, headersExtra = customHeaders, bodyStr = requestBody) => {
    setLoading(true)
    setResponseResult(null)
    setResponseError(null)

    const startTime = performance.now()

    // Construct active params string
    const activeParams = (params || []).filter(p => p.active && p.key.trim())
    let targetPath = url
    if (activeParams.length > 0) {
      const qStr = activeParams.map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`).join('&')
      targetPath = targetPath.includes('?') ? `${targetPath}&${qStr}` : `${targetPath}?${qStr}`
    }

    const path = targetPath.startsWith('/') ? targetPath.substring(1) : targetPath

    // Build headers
    const apiKeyHeader = (headersExtra || []).find(h => h.key.toLowerCase() === 'x-api-key' && h.active)?.value
      || currentKey?.key
      || 'gkp_bappeda_key_2026_x89a'

    const reqHeaders = {
      'X-API-KEY':    apiKeyHeader,
      'X-Client-ID':  String(currentKey?.appId ?? 1),
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    }

    // Append custom active headers
    ;(headersExtra || []).forEach(h => {
      if (h.active && h.key.trim()) {
        reqHeaders[h.key.trim()] = h.value.trim()
      }
    })

    try {
      let bodyData = undefined
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyStr && bodyStr.trim()) {
        try {
          bodyData = JSON.parse(bodyStr)
        } catch (jsonErr) {
          setResponseError(`Syntax Error pada Request Body JSON: ${jsonErr.message}`)
          setLoading(false)
          return
        }
      }

      const res = await gatewayApi.request({
        method:  method,
        url:     `/${path}`,
        data:    bodyData,
        headers: reqHeaders,
      })

      const elapsed = Math.round(performance.now() - startTime)
      const resObj = {
        status:     res.status,
        statusText: res.statusText || 'OK',
        time:       elapsed,
        data:       res.data,
        headers:    res.headers,
        timestamp:  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        url:        url,
        method:     method
      }

      setResponseResult(resObj)
      setRequestHistory(prev => [resObj, ...prev.slice(0, 19)])
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime)
      if (err.response) {
        const resObj = {
          status:     err.response.status,
          statusText: err.response.statusText || 'Error',
          time:       elapsed,
          data:       err.response.data,
          headers:    err.response.headers,
          timestamp:  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          url:        url,
          method:     method
        }
        setResponseResult(resObj)
        setRequestHistory(prev => [resObj, ...prev.slice(0, 19)])
      } else {
        setResponseError(`Network Connection Error: ${err.message}. Pastikan server backend Laravel berjalan di http://127.0.0.1:8000.`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Preset Select & Auto-Send from Collection Sidebar
  const handleSelectPreset = (item) => {
    setRequestMethod(item.method)
    setRequestUrl(item.url)
    const p = item.params || []
    const keyToUse = item.apiKey || currentKey?.key || 'gkp_bappeda_key_2026_x89a'
    const h = item.headers && item.headers.length > 0 ? item.headers : [
      { key: 'X-API-KEY', value: keyToUse, active: true }
    ]
    const b = item.body || ''
    setQueryParams(p)
    setCustomHeaders(h)
    setRequestBody(b)

    // Auto trigger Send request immediately
    executeSend(item.method, item.url, p, h, b)
  }

  // Handle Send API Request via Send Button
  const handleSendRequest = () => {
    executeSend(requestMethod, requestUrl, queryParams, customHeaders, requestBody)
  }

  // Prettify JSON Body
  const handlePrettifyJson = () => {
    try {
      if (requestBody.trim()) {
        const parsed = JSON.parse(requestBody)
        setRequestBody(JSON.stringify(parsed, null, 2))
      }
    } catch (e) {
      alert('Format JSON tidak valid!')
    }
  }

  // Copy Response to Clipboard
  const handleCopyResponse = () => {
    if (!responseResult?.data) return
    const text = typeof responseResult.data === 'object' ? JSON.stringify(responseResult.data, null, 2) : String(responseResult.data)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isSuccess = responseResult && responseResult.status < 400

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              API Workbench & Tester
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">
                Postman Style
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pengujian request HTTP & proxy gateway secara langsung di lingkungan lokal</p>
          </div>
        </div>

        {/* Server Target Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500">Gateway Target:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? `${window.location.protocol}//${window.location.hostname}:8000/APIGATELU`
              : 'https://ragem-api.lampungutarakab.go.id/APIGATELU'}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Sidebar (Collections/History) + Right Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: Collections & History */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm dark:shadow-xl">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
            <button
              onClick={() => setActiveSidebarTab('collections')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSidebarTab === 'collections'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Katalog API
            </button>
            <button
              onClick={() => setActiveSidebarTab('history')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSidebarTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Riwayat ({requestHistory.length})
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari endpoint..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* COLLECTIONS TAB */}
          {activeSidebarTab === 'collections' && (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {dynamicCollections.map((cat, idx) => {
                const filteredItems = cat.items.filter(item =>
                  item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  item.url.toLowerCase().includes(searchFilter.toLowerCase())
                )
                if (filteredItems.length === 0) return null

                return (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
                      {cat.category}
                    </span>
                    <div className="space-y-1">
                      {filteredItems.map((item, itemIdx) => {
                        const mColor = METHOD_COLORS[item.method] || METHOD_COLORS.GET
                        const isSelected = requestUrl === item.url && requestMethod === item.method

                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleSelectPreset(item)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                              isSelected
                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5 truncate pr-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${mColor.bg} ${mColor.text} ${mColor.border}`}>
                                  {item.method}
                                </span>
                                <span className="text-xs font-semibold truncate group-hover:text-blue-500 transition-colors">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate block opacity-90">
                                {item.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-all">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm">
                                <Play className="w-3 h-3 fill-current" />
                                <span>Run</span>
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeSidebarTab === 'history' && (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {requestHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">Belum ada riwayat pengujian request.</p>
                </div>
              ) : (
                requestHistory.map((h, idx) => {
                  const mColor = METHOD_COLORS[h.method] || METHOD_COLORS.GET
                  const hSuccess = h.status < 400

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setRequestMethod(h.method)
                        setRequestUrl(h.url)
                        setResponseResult(h)
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${mColor.bg} ${mColor.text} ${mColor.border}`}>
                          {h.method}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${hSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                          {h.status} {h.statusText}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">{h.url}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>{h.time}ms</span>
                        <span>{h.timestamp}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* RIGHT MAIN WORKSPACE: Request Builder + Response Viewer */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* SECTION 1: URL BAR & EXECUTION CONTROL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Method Selector Dropdown */}
              <div className="relative">
                <select
                  value={requestMethod}
                  onChange={e => setRequestMethod(e.target.value)}
                  className={`appearance-none bg-slate-100 dark:bg-slate-800 font-extrabold font-mono text-xs px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer pr-8 ${
                    (METHOD_COLORS[requestMethod] || METHOD_COLORS.GET).text
                  }`}
                >
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-extrabold">
                      {m}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
              </div>

              {/* URL Bar Input */}
              <div className="flex-1 relative flex items-center">
                <span className="hidden sm:inline text-xs font-mono text-slate-400 dark:text-slate-500 pl-3 pr-1 select-none shrink-0">
                  {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? `${window.location.protocol}//${window.location.hostname}:8000/APIGATELU`
                    : 'https://ragem-api.lampungutarakab.go.id/APIGATELU'}
                </span>
                <input
                  type="text"
                  value={requestUrl}
                  onChange={e => setRequestUrl(e.target.value)}
                  onKeyUp={e => e.key === 'Enter' && handleSendRequest()}
                  placeholder="/dukcapil/penduduk"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-r-none sm:rounded-l-none py-3 px-3 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </div>

            {/* Application API Key Selection Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Key className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-[11px]">Klien API:</span>
                {currentKey ? (
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono">
                    ✓ {currentKey.appName || 'Instansi OPD'} (X-Client-ID: {currentKey.appId})
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold text-[11px]">* Belum ada API Key dipilih</span>
                )}
              </div>

              <button
                onClick={() => setActiveReqTab('auth')}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                Ganti Akun / Key
              </button>
            </div>
          </div>

          {/* SECTION 2: REQUEST CONFIG TABS (Params, Headers, Auth, Body) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto text-xs font-bold">
              {[
                { id: 'params',  label: `Params (${queryParams.filter(p => p.active && p.key).length})` },
                { id: 'headers', label: `Headers (${3 + customHeaders.filter(h => h.active && h.key).length})` },
                { id: 'auth',    label: 'Auth (API Key)' },
                { id: 'body',    label: `Body (${['POST','PUT','PATCH'].includes(requestMethod) ? 'JSON' : 'None'})` }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveReqTab(t.id)}
                  className={`pb-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeReqTab === t.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* PARAMS TAB: Query String Table */}
            {activeReqTab === 'params' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>Query Parameters (Otomatis digabungkan ke URL request):</span>
                  <button
                    onClick={() => setQueryParams(prev => [...prev, { key: '', value: '', active: true }])}
                    className="text-blue-500 hover:underline flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Param
                  </button>
                </div>

                <div className="space-y-2">
                  {queryParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={param.active}
                        onChange={e => {
                          const updated = [...queryParams]
                          updated[index].active = e.target.checked
                          setQueryParams(updated)
                        }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Key (misal: page)"
                        value={param.key}
                        onChange={e => {
                          const updated = [...queryParams]
                          updated[index].key = e.target.value
                          setQueryParams(updated)
                        }}
                        className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400">=</span>
                      <input
                        type="text"
                        placeholder="Value (misal: 1)"
                        value={param.value}
                        onChange={e => {
                          const updated = [...queryParams]
                          updated[index].value = e.target.value
                          setQueryParams(updated)
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setQueryParams(prev => prev.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HEADERS TAB: Auto + Custom Headers Table */}
            {activeReqTab === 'headers' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] text-slate-400 font-sans">
                  Header Otomatis (Di-inject oleh Gateway Middleware):
                </div>

                {/* Fixed Auto Headers */}
                {[
                  ['X-Client-ID',  String(currentKey?.appId ?? '1'), 'text-blue-600 dark:text-blue-400'],
                  ['X-Secret-Key', currentKey ? `${currentKey.key?.substring(0, 24)}...` : '—', 'text-emerald-600 dark:text-emerald-400'],
                  ['Accept',       'application/json', 'text-slate-600 dark:text-slate-300'],
                ].map(([k, v, cls]) => (
                  <div key={k} className="flex items-center gap-2 opacity-90">
                    <span className="w-4 text-center text-emerald-500 font-bold">✓</span>
                    <input type="text" value={k} readOnly className="w-1/3 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-slate-500 dark:text-slate-400 font-bold select-none" />
                    <span className="text-slate-400">:</span>
                    <input type="text" value={v} readOnly className={`flex-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 font-bold ${cls} select-none`} />
                  </div>
                ))}

                {/* Custom User Headers */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>Header Tambahan:</span>
                    <button
                      onClick={() => setCustomHeaders(prev => [...prev, { key: '', value: '', active: true }])}
                      className="text-blue-500 hover:underline flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Header
                    </button>
                  </div>

                  {customHeaders.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={header.active}
                        onChange={e => {
                          const updated = [...customHeaders]
                          updated[index].active = e.target.checked
                          setCustomHeaders(updated)
                        }}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Header Key (misal: X-Custom-Header)"
                        value={header.key}
                        onChange={e => {
                          const updated = [...customHeaders]
                          updated[index].key = e.target.value
                          setCustomHeaders(updated)
                        }}
                        className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400">:</span>
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={e => {
                          const updated = [...customHeaders]
                          updated[index].value = e.target.value
                          setCustomHeaders(updated)
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setCustomHeaders(prev => prev.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTH TAB: API Key Selection */}
            {activeReqTab === 'auth' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                  💡 Autentikasi Gateway menggunakan skema <strong>API Key (X-Client-ID & X-Secret-Key)</strong>.
                  Pilih aplikasi terdaftar di bawah ini untuk mengisi kredensial secara otomatis:
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Aplikasi Klien:
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={e => setSelectedAppId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— Pilih Aplikasi —</option>
                    {apiKeys.map(k => (
                      <option key={k.id} value={k.appId}>
                        {k.appName} ({k.opd}) — Status: {k.status}
                      </option>
                    ))}
                  </select>
                </div>

                {currentKey && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>X-Client-ID:</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">{currentKey.appId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>X-Secret-Key:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{currentKey.key}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Status Token:</span>
                      <span className="text-emerald-500 font-bold uppercase">{currentKey.status}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BODY TAB: JSON Payload Editor */}
            {activeReqTab === 'body' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Request Body (JSON Format):
                  </span>
                  <button
                    onClick={handlePrettifyJson}
                    className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Prettify JSON
                  </button>
                </div>

                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={8}
                  placeholder={`{\n  "nip": "198506122010011005",\n  "status": "AKTIF"\n}`}
                  className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500 leading-relaxed shadow-inner"
                />
              </div>
            )}
          </div>

          {/* SECTION 3: RESPONSE PAYLOAD VIEWER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl min-h-[380px]">
            {/* Response Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-500" />
                  Response Payload
                </h3>
                {responseResult && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}>
                    {responseResult.status} {responseResult.statusText}
                  </span>
                )}
              </div>

              {responseResult && (
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <div>Time: <strong className="text-slate-800 dark:text-slate-200">{responseResult.time} ms</strong></div>
                  <div>Size: <strong className="text-slate-800 dark:text-slate-200">{JSON.stringify(responseResult.data || '').length} B</strong></div>
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer font-sans text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {!responseResult && !loading && !responseError && (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <Code2 className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-xs">Klik tombol <strong className="text-blue-500">Send</strong> untuk memicu eksekusi HTTP request ke Gateway</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-20 text-center text-slate-500 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Mengirim request ke Gateway → {requestUrl}...</p>
              </div>
            )}

            {/* Error Banner */}
            {responseError && !loading && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-mono leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Connection Error
                </div>
                <p>{responseError}</p>
              </div>
            )}

            {/* Response Output */}
            {responseResult && !loading && (
              <div className="space-y-3">
                {/* Response View Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3 text-xs">
                  {['pretty', 'raw', 'headers'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveResTab(tab)}
                      className={`pb-1.5 border-b-2 font-bold capitalize transition-all cursor-pointer ${
                        activeResTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeResTab === 'pretty' && (
                  <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-[360px] shadow-inner">
                    <code>{JSON.stringify(responseResult.data, null, 2)}</code>
                  </pre>
                )}

                {activeResTab === 'raw' && (
                  <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[360px] whitespace-pre-wrap shadow-inner">
                    <code>{typeof responseResult.data === 'object' ? JSON.stringify(responseResult.data) : String(responseResult.data)}</code>
                  </pre>
                )}

                {activeResTab === 'headers' && (
                  <div className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-[360px] overflow-y-auto shadow-inner">
                    {Object.entries(responseResult.headers || {}).map(([hk, hv]) => (
                      <div key={hk} className="flex gap-2">
                        <span className="text-blue-400 font-bold select-none">{hk}:</span>
                        <span className="text-slate-300">{String(hv)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

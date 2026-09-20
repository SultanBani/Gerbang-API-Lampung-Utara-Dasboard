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
// Preset Collection Endpoints (Lampung Utara Gateway API - Fallback)
const PRESET_COLLECTIONS = [
  {
    category: 'Keuangan (BPKAD)',
    items: [
      {
        name: 'PAD Lampung Utara (2023-2024)',
        method: 'GET',
        url: '/bpkad/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara',
        desc: 'Dataset PAD Resmi Lampung Utara dalam format CSV/JSON',
        params: [],
        headers: [],
        body: ''
      },
      {
        name: 'Realisasi APBD Daerah',
        method: 'GET',
        url: '/bpkad/apbd',
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
        url: '/disdukcapil/penduduk',
        desc: 'Verifikasi status kependudukan warga berbasis NIK',
        params: [{ key: 'nik', value: '1803011508900001', active: true }],
        headers: [],
        body: ''
      },
      {
        name: 'Pencarian Data Kartu Keluarga',
        method: 'GET',
        url: '/disdukcapil/keluarga',
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
        url: '/bkd/profil-asn',
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
        url: '/bappeda/program-rkpd',
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
  const fetchLogs = context.fetchLogs || (() => {})
  const fetchStats = context.fetchStats || (() => {})

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
      const opdCode = item.opd?.code || 'opd'
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
      const formattedSlug = item.slug ? (item.slug.startsWith('/') ? item.slug.substring(1) : item.slug) : item.id
      const fullEndpointUrl = `/${opdCode}/${formattedSlug}`

      methods.forEach(m => {
        const apiKey = item.user_api_key || item.api_key || ''
        groups[category].push({
          id: `${item.id}-${m}`,
          name: item.title,
          method: m,
          url: fullEndpointUrl,
          desc: item.target_url || item.description || `Endpoint ${item.title}`,
          apiKey: apiKey,
          params: [],
          headers: [],
          body: ''
        })
      })
    })

    return Object.keys(groups).map(cat => ({
      category: cat,
      items: groups[cat]
    }))
  }, [catalogEndpoints])

  // Auth API Key (Input Manual oleh User)
  const [authApiKey, setAuthApiKey] = useState('')

  // Request State
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestUrl, setRequestUrl]       = useState('/bpkad/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara')
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



  // Construct full target URL including active query parameters
  const fullTargetUrl = useMemo(() => {
    const activeParams = queryParams.filter(p => p.active && p.key.trim())
    if (activeParams.length === 0) return requestUrl

    const queryString = activeParams
      .map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
      .join('&')

    return requestUrl.includes('?') ? `${requestUrl}&${queryString}` : `${requestUrl}?${queryString}`
  }, [requestUrl, queryParams])

  // SPLP Code Generator State & Engine
  const [selectedLang, setSelectedLang] = useState('curl')
  const [copiedCode, setCopiedCode]     = useState(false)

  const clientTargetUrl = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const isProduction = hostname === 'ragem-api.lampungutarakab.go.id'
      || hostname.endsWith('.lampungutarakab.go.id')

    const host = isProduction
      ? 'https://ragem-api.lampungutarakab.go.id/APIGATELU'
      : `http://localhost:8000/APIGATELU`

    let cleanPath = fullTargetUrl
    if (cleanPath.includes('/APIGATELU/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/APIGATELU/') + '/APIGATELU/'.length)
    } else if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1)
    }

    return `${host}/${cleanPath}`
  }, [fullTargetUrl])

  const generatedCodeSnippet = useMemo(() => {
    const keyToUse = authApiKey || 'gkp_contoh_key_123'
    const headersList = [
      { key: 'X-Secret-Key', value: keyToUse },
      { key: 'Accept', value: 'application/json' }
    ]

    customHeaders.forEach(h => {
      if (h.active && h.key.trim()) {
        headersList.push({ key: h.key.trim(), value: h.value.trim() })
      }
    })

    const isBodyAllowed = ['POST', 'PUT', 'PATCH'].includes(requestMethod)
    const formattedBody = isBodyAllowed && requestBody.trim() ? requestBody.trim() : ''

    switch (selectedLang) {
      case 'curl': {
        let code = `curl -X ${requestMethod} "${clientTargetUrl}"`
        headersList.forEach(h => {
          code += ` \\\n  -H "${h.key}: ${h.value}"`
        })
        if (formattedBody) {
          code += ` \\\n  -H "Content-Type: application/json"`
          code += ` \\\n  -d '${formattedBody}'`
        }
        return code
      }

      case 'js_fetch': {
        const headerObj = {}
        headersList.forEach(h => { headerObj[h.key] = h.value })
        if (formattedBody) headerObj['Content-Type'] = 'application/json'

        let code = `fetch("${clientTargetUrl}", {\n`
        code += `  method: "${requestMethod}",\n`
        code += `  headers: ${JSON.stringify(headerObj, null, 4)},\n`
        if (formattedBody) {
          code += `  body: JSON.stringify(${formattedBody})\n`
        } else {
          code = code.replace(/,\n$/, '\n')
        }
        code += `})\n`
        code += `.then(response => response.json())\n`
        code += `.then(data => console.log("Hasil Data API:", data))\n`
        code += `.catch(error => console.error("Error Fetch API:", error));`
        return code
      }

      case 'js_axios': {
        const headerObj = {}
        headersList.forEach(h => { headerObj[h.key] = h.value })
        if (formattedBody) headerObj['Content-Type'] = 'application/json'

        let code = `import axios from 'axios';\n\n`
        code += `axios({\n`
        code += `  method: '${requestMethod.toLowerCase()}',\n`
        code += `  url: '${clientTargetUrl}',\n`
        code += `  headers: ${JSON.stringify(headerObj, null, 4)},\n`
        if (formattedBody) {
          code += `  data: ${formattedBody}\n`
        } else {
          code = code.replace(/,\n$/, '\n')
        }
        code += `})\n`
        code += `.then(response => console.log("Data Response:", response.data))\n`
        code += `.catch(error => console.error("Error Axios:", error));`
        return code
      }

      case 'php_laravel': {
        let code = `use Illuminate\\Support\\Facades\\Http;\n\n`
        code += `$response = Http::withHeaders([\n`
        headersList.forEach(h => {
          code += `    '${h.key}' => '${h.value}',\n`
        })
        if (formattedBody) {
          code += `    'Content-Type' => 'application/json',\n`
        }
        code += `])`
        if (requestMethod === 'GET') {
          code += `->get('${clientTargetUrl}');\n\n`
        } else if (formattedBody) {
          code += `->withBody('${formattedBody.replace(/'/g, "\\'")}', 'application/json')->${requestMethod.toLowerCase()}('${clientTargetUrl}');\n\n`
        } else {
          code += `->${requestMethod.toLowerCase()}('${clientTargetUrl}');\n\n`
        }
        code += `$data = $response->json();\n`
        code += `// Ambil dan gunakan data hasil API\n`
        code += `print_r($data);`
        return code
      }

      case 'php_curl': {
        let code = `<?php\n\n$curl = curl_init();\n\n`
        code += `curl_setopt_array($curl, array(\n`
        code += `  CURLOPT_URL => '${clientTargetUrl}',\n`
        code += `  CURLOPT_RETURNTRANSFER => true,\n`
        code += `  CURLOPT_CUSTOMREQUEST => '${requestMethod}',\n`
        if (formattedBody) {
          code += `  CURLOPT_POSTFIELDS => '${formattedBody.replace(/'/g, "\\'")}',\n`
        }
        code += `  CURLOPT_HTTPHEADER => array(\n`
        headersList.forEach(h => {
          code += `    '${h.key}: ${h.value}',\n`
        })
        if (formattedBody) {
          code += `    'Content-Type: application/json',\n`
        }
        code += `  ),\n`
        code += `));\n\n`
        code += `$response = curl_exec($curl);\n`
        code += `curl_close($curl);\n\n`
        code += `$data = json_decode($response, true);\n`
        code += `print_r($data);`
        return code
      }

      case 'python': {
        const headerObj = {}
        headersList.forEach(h => { headerObj[h.key] = h.value })
        if (formattedBody) headerObj['Content-Type'] = 'application/json'

        let code = `import requests\n\n`
        code += `url = "${clientTargetUrl}"\n`
        code += `headers = ${JSON.stringify(headerObj, null, 4)}\n`
        if (formattedBody) {
          code += `payload = ${formattedBody}\n\n`
          code += `response = requests.${requestMethod.toLowerCase()}(url, headers=headers, json=payload)\n`
        } else {
          code += `\nresponse = requests.${requestMethod.toLowerCase()}(url, headers=headers)\n`
        }
        code += `data = response.json()\n`
        code += `print(data)`
        return code
      }

      default:
        return ''
    }
  }, [selectedLang, clientTargetUrl, requestMethod, customHeaders, requestBody, authApiKey])

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(generatedCodeSnippet)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

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

    let path = targetPath
    if (path.includes('/APIGATELU/')) {
      path = path.substring(path.indexOf('/APIGATELU/') + '/APIGATELU/'.length)
    } else if (path.startsWith('/')) {
      path = path.substring(1)
    }

    // Build headers
    const apiKeyHeader = (headersExtra || []).find(h => (h.key.toLowerCase() === 'x-api-key' || h.key.toLowerCase() === 'x-secret-key') && h.active)?.value
      || authApiKey

    const reqHeaders = {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    }

    if (apiKeyHeader) {
      reqHeaders['X-Secret-Key'] = apiKeyHeader
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
        url:     path,
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
      if (fetchLogs) fetchLogs({ page: 1, per_page: 15 })
      if (fetchStats) fetchStats()
    }
  }

  // Handle Preset Select & Auto-Send from Collection Sidebar
  const handleSelectPreset = (item) => {
    setRequestMethod(item.method)
    setRequestUrl(item.url)
    const p = item.params || []
    if (item.apiKey) setAuthApiKey(item.apiKey)
    const h = item.headers && item.headers.length > 0 ? item.headers : []
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
              APIGATE Workbench & Tester
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Pengambilan & Penginputan Data
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pengujian langsung pengambilan data (GET) dan penginputan data (POST) antar-OPD</p>
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
                <span className="font-semibold text-[11px]">API Key:</span>
                {authApiKey ? (
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1">
                    ✓ Terisi
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold text-[11px]">* Belum diisi</span>
                )}
              </div>

              <button
                onClick={() => setActiveReqTab('auth')}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                Input API Key
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
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex items-center gap-2">
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
                          className="w-full sm:w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
                        />
                      </div>
                      <span className="hidden sm:inline text-slate-400 font-mono">=</span>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Value (misal: 1)"
                          value={param.value}
                          onChange={e => {
                            const updated = [...queryParams]
                            updated[index].value = e.target.value
                            setQueryParams(updated)
                          }}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
                        />
                        <button
                          onClick={() => setQueryParams(prev => prev.filter((_, i) => i !== index))}
                          className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  ['X-Secret-Key', authApiKey ? `${authApiKey.substring(0, 16)}...` : '—', 'text-emerald-600 dark:text-emerald-400'],
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
                  💡 Masukkan <strong>API Key</strong> (X-Secret-Key) yang Anda peroleh dari halaman <strong>Katalog API</strong> (setelah permohonan disetujui) untuk mengakses endpoint ini secara sah.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    API Key (X-Secret-Key):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: gkp_dinkes_key_xxyz..."
                    value={authApiKey}
                    onChange={e => setAuthApiKey(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
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
                    <code>
                      {(() => {
                        let dataToDisplay = responseResult.data;
                        let isTruncated = false;
                        
                        // Jika data adalah array raksasa, potong untuk mencegah browser crash
                        if (Array.isArray(dataToDisplay) && dataToDisplay.length > 50) {
                          dataToDisplay = [...dataToDisplay.slice(0, 50), `... [TAMPILAN DIPOTONG: Menampilkan 50 dari ${dataToDisplay.length} baris. Salin payload untuk melihat keseluruhan] ...`];
                          isTruncated = true;
                        }
                        
                        let str = JSON.stringify(dataToDisplay, null, 2);
                        if (!isTruncated && str.length > 50000) {
                           str = str.substring(0, 50000) + '\n\n... [TAMPILAN DIPOTONG: Data terlalu besar] ...';
                        }
                        return str;
                      })()}
                    </code>
                  </pre>
                )}

                {activeResTab === 'raw' && (
                  <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[360px] whitespace-pre-wrap shadow-inner">
                    <code>
                      {(() => {
                        let dataToDisplay = responseResult.data;
                        let isTruncated = false;
                        
                        if (Array.isArray(dataToDisplay) && dataToDisplay.length > 50) {
                          dataToDisplay = [...dataToDisplay.slice(0, 50), `... [TAMPILAN DIPOTONG: Menampilkan 50 dari ${dataToDisplay.length} baris. Salin payload untuk melihat keseluruhan] ...`];
                          isTruncated = true;
                        }
                        
                        let str = typeof dataToDisplay === 'object' ? JSON.stringify(dataToDisplay) : String(dataToDisplay);
                        if (!isTruncated && str.length > 50000) {
                           str = str.substring(0, 50000) + '\n\n... [TAMPILAN DIPOTONG: Data terlalu besar] ...';
                        }
                        return str;
                      })()}
                    </code>
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

          {/* SECTION 4: SPLP INTEGRATION CODE GENERATOR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  Kodingan Integrasi Klien
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Salin potongan kode di bawah ini ke kodingan aplikasi Anda untuk mengambil data secara langsung via API
                </p>
              </div>

              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Kodingan Tersalin!' : 'Salin Kodingan'}</span>
              </button>
            </div>

            {/* Language Selection Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto text-xs pb-1">
              {[
                { id: 'curl',        label: 'cURL (Bash)' },
                { id: 'js_fetch',    label: 'JavaScript (Fetch)' },
                { id: 'js_axios',    label: 'JavaScript (Axios)' },
                { id: 'php_laravel', label: 'PHP (Laravel Http)' },
                { id: 'php_curl',    label: 'PHP (Native cURL)' },
                { id: 'python',     label: 'Python (Requests)' },
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedLang === lang.id
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Generated Snippet Display */}
            <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[320px] shadow-inner select-all">
              <code>{generatedCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

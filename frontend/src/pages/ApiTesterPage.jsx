import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Send, Loader2 } from 'lucide-react'
import { gatewayApi } from '../services/api'

export default function ApiTesterPage() {
  const { applications, apiKeys, fetchApplications } = useApiGateway()

  const [selectedAppId, setSelectedAppId] = useState('')
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestUrl, setRequestUrl]       = useState('/dukcapil/penduduk')
  const [activeTab, setActiveTab]         = useState('headers')
  const [requestBody, setRequestBody]     = useState('')
  const [loading, setLoading]             = useState(false)
  const [responseResult, setResponseResult] = useState(null)
  const [responseError, setResponseError]   = useState(null)

  const quickEndpoints = [
    { label: 'Dukcapil NIK', path: '/dukcapil/penduduk', method: 'GET' },
    { label: 'BKD Kepegawaian', path: '/kepegawaian/v1/data', method: 'GET' },
    { label: 'Bappeda Program', path: '/perencanaan/program', method: 'GET' },
    { label: 'BPKAD APBD', path: '/keuangan/apbd', method: 'GET' },
  ]

  useEffect(() => {
    if (applications.length === 0) fetchApplications()
  }, [applications.length, fetchApplications])

  // Saat data aplikasi sudah ada, set default selectedAppId ke aplikasi pertama
  useEffect(() => {
    if (apiKeys.length > 0 && !selectedAppId) {
      setSelectedAppId(String(apiKeys[0].appId ?? apiKeys[0].application_id))
    }
  }, [apiKeys, selectedAppId])

  const currentKey = useMemo(() => {
    const id = Number(selectedAppId)
    return apiKeys.find(k => (k.appId === id || k.application_id === id) && k.status === 'active') ?? apiKeys.find(k => k.appId === id || k.application_id === id)
  }, [apiKeys, selectedAppId])

  const handleSendRequest = async () => {
    if (!currentKey) {
      setResponseError('Pilih aplikasi yang memiliki API Key aktif terlebih dahulu.')
      return
    }
    setLoading(true)
    setResponseResult(null)
    setResponseError(null)

    const startTime = performance.now()
    // Path untuk gateway: hapus leading slash jika ada, gateway prefix ditambahkan axios
    const path = requestUrl.startsWith('/') ? requestUrl.substring(1) : requestUrl

    try {
      let body = undefined
      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBody.trim()) {
        body = JSON.parse(requestBody)
      }

      const res = await gatewayApi.request({
        method:  requestMethod,
        url:     `/${path}`,
        data:    body,
        headers: {
          'X-Client-ID':  String(currentKey.appId ?? currentKey.application_id),
          'X-Secret-Key': currentKey.key,
          'Accept':       'application/json',
          'Content-Type': 'application/json',
        },
      })

      const elapsed = Math.round(performance.now() - startTime)
      setResponseResult({
        status:     res.status,
        statusText: res.statusText,
        time:       elapsed,
        data:       res.data,
        headers:    res.headers,
      })
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime)
      if (err.response) {
        setResponseResult({
          status:     err.response.status,
          statusText: err.response.statusText,
          time:       elapsed,
          data:       err.response.data,
          headers:    err.response.headers,
        })
      } else {
        setResponseError(`Network Error: ${err.message}. Pastikan Laravel server berjalan di http://localhost:8000`)
      }
    } finally {
      setLoading(false)
    }
  }

  const isSuccess = responseResult && responseResult.status < 400

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* REQUEST BUILDER PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📤</span> Request API Builder
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              → http://localhost:8000/gateway/
            </span>
          </div>

          {/* App Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pilih Aplikasi Klien (Auto-fill API Key)</label>
            <select
              value={selectedAppId}
              onChange={e => setSelectedAppId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">— Pilih Aplikasi —</option>
              {apiKeys.map(k => (
                <option key={k.id} value={k.appId ?? k.application_id}>
                  {k.appName ?? k.application?.name} ({k.opd ?? k.application?.opd}) — Status: {k.status}
                </option>
              ))}
            </select>
            {currentKey && (
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
                ✓ X-Client-ID: <strong>{currentKey.appId ?? currentKey.application_id}</strong> &nbsp;|&nbsp;
                X-Secret-Key: <strong>{currentKey.key?.substring(0, 18)}...</strong>
              </p>
            )}
          </div>

          {/* URL Input Bar */}
          <div className="space-y-2">
            <div className="flex items-center">
              <select
                value={requestMethod}
                onChange={e => setRequestMethod(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-xs px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-l-xl border-r-0 focus:outline-none"
              >
                {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                value={requestUrl}
                onChange={e => setRequestUrl(e.target.value)}
                type="text"
                placeholder="/dukcapil/penduduk"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 py-2.5 px-3.5 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendRequest}
                disabled={loading || !currentKey}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-r-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>

            {/* Quick Endpoint Selection Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Pilih Route Contoh:</span>
              {quickEndpoints.map((ep, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRequestMethod(ep.method)
                    setRequestUrl(ep.path)
                  }}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  {ep.label} ({ep.path})
                </button>
              ))}
            </div>
          </div>

          {/* Request Tabs */}
          <div>
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
              {['headers', 'body', 'params'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer capitalize ${activeTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
                  {tab === 'headers' ? 'Headers (3)' : tab === 'body' ? 'Body (JSON)' : 'Params'}
                </button>
              ))}
            </div>

            {activeTab === 'headers' && (
              <div className="py-3 space-y-2 font-mono text-xs">
                {[
                  ['X-Client-ID',  String(currentKey?.appId ?? currentKey?.application_id ?? '—'), 'text-blue-600 dark:text-blue-400'],
                  ['X-Secret-Key', currentKey ? `${currentKey.key?.substring(0, 20)}...` : '—', 'text-emerald-600 dark:text-emerald-400'],
                  ['Accept',       'application/json', 'text-slate-600 dark:text-slate-300'],
                ].map(([k, v, cls]) => (
                  <div key={k} className="flex items-center gap-2">
                    <input type="text" value={k} readOnly className="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-400">:</span>
                    <input type="text" value={v} readOnly className={`flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-bold ${cls}`} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'body' && (
              <div className="py-3">
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={6}
                  placeholder={'{\n  "nip": "198001012005011001"\n}'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-600 dark:text-blue-300 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            )}

            {activeTab === 'params' && (
              <div className="py-3 space-y-2 font-mono text-xs">
                {[['page','1'],['per_page','15']].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <input type="text" value={k} readOnly className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                    <span className="text-slate-400">=</span>
                    <input type="text" value={v} readOnly className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESPONSE VIEWER PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>📥</span> Response Payload</h3>
              {responseResult && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded font-bold border ${isSuccess ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'}`}>
                    {responseResult.status} {responseResult.statusText}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{responseResult.time}ms</span>
                </div>
              )}
            </div>

            {!responseResult && !loading && !responseError && (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <div className="text-4xl">📭</div>
                <p className="text-xs">Klik <strong>Send</strong> untuk melakukan pengujian request ke Gateway</p>
                <p className="text-[10px] text-slate-400">Target: http://localhost:8000/gateway{requestUrl}</p>
              </div>
            )}

            {loading && (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="text-xs font-mono">Mengirim request ke Gateway → {requestUrl}...</p>
              </div>
            )}

            {responseError && !loading && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-mono leading-relaxed">
                <p className="font-bold mb-1">⚠ Connection Error</p>
                <p>{responseError}</p>
              </div>
            )}

            {responseResult && !loading && (
              <div className="relative">
                <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed max-h-[320px]">
                  <code>{JSON.stringify(responseResult.data, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>

          {responseResult && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[11px] text-slate-500">
              <span>Content-Type: application/json</span>
              <span>Size: {JSON.stringify(responseResult.data).length} B</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

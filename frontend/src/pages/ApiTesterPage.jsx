import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Send, Loader2 } from 'lucide-react'

export default function ApiTesterPage() {
  const { applications, apiKeys, addRequestLog } = useApiGateway()

  const [selectedAppId, setSelectedAppId] = useState(1)
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestUrl, setRequestUrl] = useState('/api/pegawai')
  const [activeTab, setActiveTab] = useState('headers')
  const [requestBody, setRequestBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [responseResult, setResponseResult] = useState(null)

  const currentApiKey = useMemo(() => {
    const k = apiKeys.find(key => key.appId === selectedAppId)
    return k ? k.key : '3f8c9e2a1b4d7e8f9a0b1c2d3e4f5a6b'
  }, [apiKeys, selectedAppId])

  const handleSendRequest = () => {
    setLoading(true)
    setResponseResult(null)

    setTimeout(() => {
      setLoading(false)
      const url = requestUrl.toLowerCase()
      let mockData = {}
      const latency = Math.floor(Math.random() * 80) + 40

      if (url.includes('pegawai')) {
        mockData = {
          success: true,
          message: 'Data pegawai ASN Kabupaten Lampung Utara berhasil diambil',
          data: [
            { id: 1, nip: '198001012005011001', nama: 'Ahmad Budi Santoso', jabatan: 'Analis Kepegawaian', opd: 'BKPSDM' },
            { id: 2, nip: '197505152000032002', nama: 'Siti Rahma Dewi', jabatan: 'Kepala Seksi', opd: 'Diskominfo' }
          ],
          meta: { total: 3821, page: 1, per_page: 15 }
        }
      } else if (url.includes('opd')) {
        mockData = {
          success: true,
          data: [
            { id: 1, nama: 'BKPSDM', kepala: 'Drs. H. Slamet' },
            { id: 2, nama: 'Diskominfo', kepala: 'H. Ahmad Rifa\'i' },
            { id: 3, nama: 'BPKAD', kepala: 'Drs. Hendra Jaya' }
          ]
        }
      } else {
        mockData = {
          success: true,
          message: `Request ${requestMethod} ke ${requestUrl} berhasil diproses oleh Gerbang API`,
          timestamp: new Date().toISOString()
        }
      }

      setResponseResult({
        status: 200,
        statusText: 'OK',
        time: latency,
        data: mockData
      })

      const app = applications.find(a => a.id === selectedAppId)
      addRequestLog({
        id: Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        appName: app ? app.name : 'SIMPEG',
        method: requestMethod,
        url: requestUrl,
        statusCode: 200,
        responseTimeMs: latency,
        ipAddress: '127.0.0.1 (Tester)',
        aiAnalysis: null
      })
    }, 700)
  }

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
              Environment: Local Server
            </span>
          </div>

          {/* App Auto-fill Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pilih Aplikasi Klien (Auto-fill API Key)</label>
            <select
              value={selectedAppId}
              onChange={e => setSelectedAppId(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {apiKeys.map(appKey => (
                <option key={appKey.id} value={appKey.appId}>
                  {appKey.appName} ({appKey.opd}) — Key: {appKey.key.substring(0, 8)}...
                </option>
              ))}
            </select>
          </div>

          {/* URL Input Bar */}
          <div className="flex items-center">
            <select
              value={requestMethod}
              onChange={e => setRequestMethod(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-xs px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-l-xl border-r-0 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              value={requestUrl}
              onChange={e => setRequestUrl(e.target.value)}
              type="text"
              placeholder="/api/pegawai"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 py-2.5 px-3.5 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-r-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send</span>
            </button>
          </div>

          {/* Request Tabs */}
          <div>
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
              <button
                onClick={() => setActiveTab('headers')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Headers (3)
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'body' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Body (JSON)
              </button>
              <button
                onClick={() => setActiveTab('params')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'params' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Params
              </button>
            </div>

            {/* Headers Content */}
            {activeTab === 'headers' && (
              <div className="py-3 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <input type="text" value="Authorization" readOnly className="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-400 dark:text-slate-600">:</span>
                  <input type="text" value={`Bearer ${currentApiKey}`} readOnly className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value="Accept" readOnly className="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-400 dark:text-slate-600">:</span>
                  <input type="text" value="application/json" readOnly className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value="X-App-ID" readOnly className="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-400 dark:text-slate-600">:</span>
                  <input type="text" value={`app-${selectedAppId}`} readOnly className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                </div>
              </div>
            )}

            {/* Body JSON Content */}
            {activeTab === 'body' && (
              <div className="py-3">
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={6}
                  placeholder='{\n  "nip": "198001012005011001",\n  "nama": "Ahmad Budi S."\n}'
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-600 dark:text-blue-300 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            )}

            {/* Params Content */}
            {activeTab === 'params' && (
              <div className="py-3 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <input type="text" value="page" readOnly className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                  <span className="text-slate-400 dark:text-slate-600">=</span>
                  <input type="text" value="1" readOnly className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value="per_page" readOnly className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                  <span className="text-slate-400 dark:text-slate-600">=</span>
                  <input type="text" value="15" readOnly className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESPONSE VIEWER PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📥</span> Response Payload
              </h3>

              {responseResult && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded font-bold ${responseResult.status === 200 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'}`}>
                    {responseResult.status} {responseResult.statusText}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{responseResult.time}ms</span>
                </div>
              )}
            </div>

            {/* Empty Placeholder */}
            {!responseResult && !loading && (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <div className="text-4xl">📭</div>
                <p className="text-xs">Klik <strong>Send</strong> untuk melakukan pengujian request API</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="text-xs font-mono">Mengirim request ke API Gateway...</p>
              </div>
            )}

            {/* JSON Response Payload Output */}
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

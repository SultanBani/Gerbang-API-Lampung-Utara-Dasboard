import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Download, Bot, X } from 'lucide-react'

export default function LogRequestPage() {
  const { applications, requestLogs } = useApiGateway()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterApp, setFilterApp] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLogForAi, setSelectedLogForAi] = useState(null)

  const filteredLogs = useMemo(() => {
    return requestLogs.filter(log => {
      const matchQuery =
        log.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery)

      const matchApp = filterApp === 'all' || log.appName === filterApp
      const matchStatus = filterStatus === 'all' || log.statusCode === Number(filterStatus)

      return matchQuery && matchApp && matchStatus
    })
  }, [requestLogs, searchQuery, filterApp, filterStatus])

  const exportCsv = () => {
    const headers = ['Timestamp', 'Application', 'Method', 'URL', 'StatusCode', 'LatencyMs', 'IPAddress']
    const rows = filteredLogs.map(l => [
      l.timestamp, l.appName, l.method, l.url, l.statusCode, l.responseTimeMs, l.ipAddress
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `log-request-gerbang-api-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Cari aplikasi, URL, atau IP Address..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
            />
          </div>

          <select
            value={filterApp}
            onChange={e => setFilterApp(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 shadow-sm"
          >
            <option value="all">Semua Aplikasi</option>
            {applications.map(app => (
              <option key={app.id} value={app.name}>{app.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 shadow-sm"
          >
            <option value="all">Semua Status</option>
            <option value="200">200 OK</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="500">500 Server Error</option>
          </select>
        </div>

        <button
          onClick={exportCsv}
          className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Waktu Transaksi</th>
                <th className="py-3.5 px-5">Aplikasi Klien</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">URL Endpoint</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Latency</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5 text-center">Analisis AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                    log.statusCode >= 400 ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-200">{log.appName}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        log.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        log.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-800 dark:text-slate-200">
                    <code>{log.url}</code>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                        log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                        log.statusCode === 401 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                        log.statusCode === 403 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                        'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-mono text-slate-500 dark:text-slate-400">{log.responseTimeMs}ms</td>
                  <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{log.ipAddress}</td>
                  <td className="py-4 px-5 text-center">
                    {log.statusCode >= 400 ? (
                      <button
                        onClick={() => setSelectedLogForAi(log)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Analisis AI</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Tidak ada log transaksi yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Error Analysis Modal */}
      {selectedLogForAi && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                <Bot className="w-4 h-4" />
                <span>AI Error Analyzer — Status {selectedLogForAi.statusCode}</span>
              </div>
              <button onClick={() => setSelectedLogForAi(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Log Summary */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                <div><span className="text-slate-500">Aplikasi:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedLogForAi.appName}</strong></div>
                <div><span class="text-slate-500">Endpoint:</span> <strong className="text-blue-600 dark:text-blue-400">{selectedLogForAi.method} {selectedLogForAi.url}</strong></div>
                <div><span className="text-slate-500">Waktu:</span> <span className="text-slate-600 dark:text-slate-300">{selectedLogForAi.timestamp}</span></div>
              </div>

              {/* Analysis Output */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3 leading-relaxed">
                <h4 className="font-extrabold text-amber-700 dark:text-amber-300 text-xs">🔍 Analisis & Rekomendasi Solusi:</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{selectedLogForAi.aiAnalysis || 'Analisis otomatis: Terjadi kendala saat memproses request pada server gateway.'}</p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 text-center">
                ⚡ Analisis ini diproduksi secara real-time oleh Modul AI Gateway Assistant.
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLogForAi(null)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

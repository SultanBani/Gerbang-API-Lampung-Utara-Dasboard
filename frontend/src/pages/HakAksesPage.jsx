import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Loader2 } from 'lucide-react'

export default function HakAksesPage() {
  const { accessControls, fetchAccessControls, toggleAccess, loading } = useApiGateway()
  const [selectedAppId, setSelectedAppId] = useState('all')

  useEffect(() => { fetchAccessControls() }, [fetchAccessControls])

  const { applications = [], endpoints = [], matrix = {} } = accessControls ?? {}

  const displayedApps = useMemo(() => {
    if (selectedAppId === 'all') return applications
    return applications.filter(a => a.id === Number(selectedAppId))
  }, [applications, selectedAppId])

  const isAllowed = (appId, endpointId) => {
    const key = `${appId}:${endpointId}`
    return !!(matrix[key]?.is_allowed)
  }

  const totalGrants = useMemo(() =>
    Object.values(matrix).filter(v => v.is_allowed).length
  , [matrix])

  return (
    <div className="space-y-6">
      {/* Filter and Info Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🔐</span> Matriks Authorization API Gateway
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Klik toggle untuk mengubah hak akses secara langsung. Perubahan langsung aktif di gateway.
            <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">{totalGrants} izin aktif</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Filter Aplikasi:</label>
          <select
            value={selectedAppId}
            onChange={e => setSelectedAppId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="all">Tampilkan Semua Aplikasi</option>
            {applications.map(app => (
              <option key={app.id} value={app.id}>{app.name} ({app.opd})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Authorization Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        {loading.accessControls
          ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6 min-w-[240px]">Endpoint API</th>
                    {displayedApps.map(app => (
                      <th key={app.id} className="py-4 px-4 text-center min-w-[110px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{app.name}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 font-normal lowercase tracking-normal">{app.opd}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {endpoints.map(ep => (
                    <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            ep.method === 'GET'  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            ep.method === 'PUT'  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>{ep.method}</span>
                          <code className="font-mono text-slate-800 dark:text-slate-200 font-bold text-xs">{ep.url}</code>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{ep.description}</span>
                      </td>
                      {displayedApps.map(app => {
                        const allowed = isAllowed(app.id, ep.id)
                        return (
                          <td key={app.id} className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => toggleAccess(app.id, ep.id)}
                              className={`w-11 h-6 rounded-full transition-all duration-200 relative p-1 focus:outline-none shadow-inner cursor-pointer ${
                                allowed ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                              }`}
                              title={`${app.name} → ${ep.method} ${ep.url}: ${allowed ? 'Diizinkan' : 'Ditolak'}`}
                            >
                              <span className={`w-4 h-4 rounded-full bg-white block transition-transform duration-200 shadow-md ${allowed ? 'translate-x-5' : 'translate-x-0'}`}></span>
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {endpoints.length === 0 && (
                    <tr><td colSpan={displayedApps.length + 1} className="py-12 text-center text-slate-400">Belum ada data endpoint.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        }

        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span><span>Diizinkan (200 OK)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 inline-block"></span><span>Ditolak (403 Forbidden)</span></div>
          </div>
          <span className="text-[11px] text-slate-500">* Perubahan langsung aktif tanpa restart server.</span>
        </div>
      </div>
    </div>
  )
}

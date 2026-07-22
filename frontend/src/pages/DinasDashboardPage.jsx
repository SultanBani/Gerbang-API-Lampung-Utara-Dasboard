import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Building2, Key, CheckCircle, ShieldAlert, Code2, Copy, Check, Terminal, ExternalLink, Activity } from 'lucide-react'

export default function DinasDashboardPage() {
  const { user, logout } = useAuth()
  const { endpoints, fetchEndpoints, accessControls, fetchAccessControls, logs, fetchLogs } = useApiGateway()
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    fetchEndpoints()
    fetchAccessControls()
    if (user?.application_id) {
      fetchLogs({ application_id: user.application_id })
    }
  }, [fetchEndpoints, fetchAccessControls, fetchLogs, user])

  const app = user?.application
  const activeKey = app?.api_keys?.find(k => k.status === 'active') || app?.api_keys?.[0]

  // Filter allowed endpoints for this OPD from the matrix
  const allowedEndpoints = endpoints.filter(ep => {
    if (!app?.id) return false
    const key = `${app.id}:${ep.id}`
    const permission = accessControls?.matrix?.[key]
    return permission?.is_allowed ?? false
  })

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <div className="space-y-6">
      
      {/* Banner OPD Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5" />
              {user?.opd_name || 'Portal Instansi OPD'}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.name || 'Dashboard Instansi OPD'}
            </h1>
            <p className="text-xs text-slate-300">
              Selamat datang di Portal Layanan API Interoperabilitas Daerah Kabupaten Lampung Utara.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Status Aplikasi</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {app?.status?.toUpperCase() || 'AKTIF'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Key & Application Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* API Key Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">API Key Instansi</h3>
                  <p className="text-[11px] text-slate-400">Kredensial Otorisasi Gateway</p>
                </div>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                ACTIVE
              </span>
            </div>

            {activeKey ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">X-Secret-Key</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <code className="text-xs font-mono text-amber-300 truncate flex-1">
                      {activeKey.key}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeKey.key)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs"
                      title="Salin Key"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Header HTTP Mandatory:
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <div><span className="text-blue-400">X-Client-ID:</span> {app?.id || '1'}</div>
                    <div><span className="text-blue-400">X-Secret-Key:</span> {activeKey.key}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Belum ada API Key aktif. Hubungi Admin Diskominfo untuk menerbitkan key baru.
              </div>
            )}
          </div>

          {/* Application Detail Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Detail Aplikasi Terdaftar
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Nama Aplikasi:</span>
                <span className="font-semibold text-slate-200">{app?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Instansi OPD:</span>
                <span className="font-semibold text-slate-200">{app?.opd || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Penanggung Jawab (PIC):</span>
                <span className="font-semibold text-slate-200">{app?.pic_name || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Telepon PIC:</span>
                <span className="font-semibold text-slate-200">{app?.pic_phone || '-'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Allowed Endpoints & Quick Tester */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Permitted Endpoints */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Endpoint API yang Diizinkan ({allowedEndpoints.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daftar endpoint layanan yang telah disetujui untuk diakses oleh instansi Anda.
                </p>
              </div>
            </div>

            {allowedEndpoints.length > 0 ? (
              <div className="space-y-3">
                {allowedEndpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-xs font-mono text-blue-300 font-semibold">
                          /gateway/{ep.url}
                        </code>
                      </div>
                      <p className="text-xs text-slate-400">{ep.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ep.rate_limit || 60} req/min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs text-center">
                Belum ada endpoint yang diizinkan untuk instansi ini. Hubungi Admin untuk mengajukan perizinan.
              </div>
            )}
          </div>

          {/* Activity Logs for OPD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Riwayat Request API Instansi
              </h3>
            </div>

            <div className="space-y-2">
              {(logs.data || []).length > 0 ? (
                (logs.data || []).slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status_code < 400 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.status_code}
                      </span>
                      <code className="font-mono text-slate-300">{log.url}</code>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      {log.response_time_ms}ms
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Belum ada aktivitas request terdeteksi.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

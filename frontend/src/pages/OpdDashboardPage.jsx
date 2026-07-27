import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Building2, Shield, Send, Globe, AlertTriangle, Clock, CheckCircle, XCircle, Key, Check, Copy, Link2
} from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { useTheme } from '../context/ThemeContext'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const methodColor = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

function StatCard({ icon: Icon, value, label, hint, accentColor = 'blue' }) {
  const colors = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',   blur: 'bg-blue-500/10 group-hover:bg-blue-500/20',   border: 'hover:border-blue-300' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', blur: 'bg-indigo-500/10 group-hover:bg-indigo-500/20', border: 'hover:border-indigo-300' },
    emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-600 dark:text-emerald-400', blur:'bg-emerald-500/10 group-hover:bg-emerald-500/20', border:'hover:border-emerald-300' },
    amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',  blur: 'bg-amber-500/10 group-hover:bg-amber-500/20',  border: 'hover:border-amber-300' },
  }
  const c = colors[accentColor] || colors.blue
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${c.border} dark:hover:border-slate-700 shadow-sm group`}>
      <div className={`absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 ${c.blur}`}></div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.bg} ${c.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{value}</p>
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{label}</span>
      {hint && <span className={`text-[10px] font-bold block mt-2 text-slate-400 dark:text-slate-500`}>{hint}</span>}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
      {status?.toUpperCase()}
    </span>
  )
}

export default function OpdDashboardPage() {
  const { user } = useAuth()
  const { isDark } = useTheme()

  const [catalogEndpoints, setCatalogEndpoints] = useState([])
  const [myEndpoints, setMyEndpoints] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [myAccessRequests, setMyAccessRequests] = useState([])
  
  const [copiedId, setCopiedId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const copyUrl = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fetchData = useCallback(async () => {
    try {
      const [catalogRes, myEpRes, incomingRes, myReqRes] = await Promise.allSettled([
        api.get('/api/opd/catalog'),
        api.get('/api/opd/my-endpoints'),
        api.get('/api/opd/incoming-requests'),
        api.get('/api/opd/my-access-requests'),
      ])
      if (catalogRes.status === 'fulfilled') setCatalogEndpoints(catalogRes.value.data?.data || [])
      if (myEpRes.status === 'fulfilled') setMyEndpoints(myEpRes.value.data?.data || [])
      if (incomingRes.status === 'fulfilled') setIncomingRequests(incomingRes.value.data?.data || [])
      if (myReqRes.status === 'fulfilled') setMyAccessRequests(myReqRes.value.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch OPD data:', err)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/api/opd/incoming-requests/${id}/${action}`)
      showToast(action === 'approve' ? 'Akses disetujui & API Key di-generate!' : 'Permintaan ditolak.')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memproses permintaan.', 'error')
    }
  }

  // Calculate stats for chart
  const requestStats = useMemo(() => {
    const stats = { pending: 0, approved: 0, rejected: 0 }
    incomingRequests.forEach(req => {
      if (stats[req.status] !== undefined) stats[req.status]++
    })
    return stats
  }, [incomingRequests])

  const chartData = {
    labels: ['Menunggu (Pending)', 'Disetujui (Approved)', 'Ditolak (Rejected)'],
    datasets: [{
      data: [requestStats.pending, requestStats.approved, requestStats.rejected],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)', // amber
        'rgba(16, 185, 129, 0.8)', // emerald
        'rgba(239, 68, 68, 0.8)',  // red
      ],
      borderColor: [
        '#f59e0b',
        '#10b981',
        '#ef4444'
      ],
      borderWidth: 1.5,
    }]
  }
  
  const textColor = isDark ? '#94a3b8' : '#475569'
  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 15 } } 
    },
    cutout: '70%',
  }

  const pendingCount = incomingRequests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-sm text-sm font-semibold animate-in slide-in-from-right duration-300 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/30 text-red-200'
            : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ─── Welcome Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/70 dark:via-indigo-900/50 dark:to-slate-900 border border-blue-200 dark:border-blue-500/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2394a3b8%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-100 dark:opacity-50" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              Portal OPD — {user?.opd?.name || 'Instansi OPD'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Selamat datang, {user?.name || 'Pengguna OPD'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Pantau seluruh aktivitas pengajuan akses API di Dashboard ini. Gunakan sidebar untuk mengelola atau mencari endpoint baru.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/60 text-right shadow-sm dark:shadow-none">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Kode OPD</div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">{user?.opd?.code || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Statistik Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Shield} value={myEndpoints.length} label="API Milik Sendiri" hint="Endpoint yang Anda kelola" accentColor="indigo" />
        <StatCard icon={Globe} value={catalogEndpoints.length} label="Katalog Tersedia" hint="Dari OPD lain" accentColor="blue" />
        <StatCard icon={Send} value={myAccessRequests.length} label="Pengajuan Saya" hint="Permintaan ke API luar" accentColor="emerald" />
        <StatCard icon={AlertTriangle} value={pendingCount} label="Menunggu Aksi" hint="Permintaan masuk (Pending)" accentColor={pendingCount > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── Chart Status Permintaan Masuk ───────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Status Permintaan Masuk</h3>
          {incomingRequests.length > 0 ? (
            <div className="flex-1 relative min-h-[220px]">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{incomingRequests.length}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">TOTAL</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-10">
              <AlertTriangle className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-xs text-slate-500">Belum ada data permintaan masuk</p>
            </div>
          )}
        </div>

        {/* ─── Laporan OPD Pemohon (Incoming Requests) ─────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Permintaan Akses Masuk
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                  {pendingCount} PENDING
                </span>
              )}
            </h3>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {incomingRequests.length > 0 ? incomingRequests.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{req.requestor_opd?.name || 'OPD Pemohon'}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Meminta akses ke: <span className="font-semibold text-slate-800 dark:text-slate-300">{req.endpoint?.title || '-'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(req.requested_methods || []).map(m => (
                        <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                      ))}
                    </div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-600/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-600/25 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-100 dark:bg-red-600/15 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-600/25 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                  {req.status === 'approved' && req.api_key && (
                    <div className="shrink-0">
                      <button onClick={() => copyUrl(req.api_key, `key-${req.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
                        {copiedId === `key-${req.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        Copy API Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-500">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Belum ada permintaan akses masuk ke endpoint Anda.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Building2, Shield, Globe, ExternalLink
} from 'lucide-react'

const methodColor = {
  GET: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

function StatCard({ icon: Icon, value, label, hint, accentColor = 'blue' }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', blur: 'bg-blue-500/10 group-hover:bg-blue-500/20', border: 'hover:border-blue-300' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', blur: 'bg-indigo-500/10 group-hover:bg-indigo-500/20', border: 'hover:border-indigo-300' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', blur: 'bg-emerald-500/10 group-hover:bg-emerald-500/20', border: 'hover:border-emerald-300' },
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

const getFullGatewayUrl = (opdCode, slug) => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `${window.location.protocol}//${host}:8000/APIGATELU/${opdCode}/${slug}`
    }
  }
  return `https://ragem-api.lampungutarakab.go.id/APIGATELU/${opdCode}/${slug}`
}

export default function OpdDashboardPage() {
  const { user } = useAuth()

  const [catalogEndpoints, setCatalogEndpoints] = useState([])
  const [myEndpoints, setMyEndpoints] = useState([])

  const fetchData = useCallback(async () => {
    try {
      const [catalogRes, myEpRes] = await Promise.allSettled([
        api.get('/api/opd/catalog'),
        api.get('/api/opd/my-endpoints'),
      ])
      if (catalogRes.status === 'fulfilled') setCatalogEndpoints(catalogRes.value.data?.data || [])
      if (myEpRes.status === 'fulfilled') setMyEndpoints(myEpRes.value.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch OPD data:', err)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">

      {/* ─── Welcome Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/70 dark:via-indigo-900/50 dark:to-slate-900 border border-blue-200 dark:border-blue-500/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2394a3b8%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-100 dark:opacity-50" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              Portal OPD  {user?.opd?.name || 'Instansi OPD'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Selamat datang, {user?.name || 'Pengguna OPD'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Kelola endpoint API milik instansi Anda dan jelajahi katalog API dari OPD lain. Semua data API bersifat publik dan dapat diakses langsung.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={Shield} value={myEndpoints.length} label="API Milik Sendiri" hint="Endpoint yang Anda kelola" accentColor="indigo" />
        <StatCard icon={Globe} value={catalogEndpoints.length} label="Katalog Tersedia" hint="Seluruh API publik di gateway" accentColor="blue" />
        <StatCard icon={Building2} value={new Set(catalogEndpoints.map(e => e.opd_id)).size} label="OPD Terdaftar" hint="Instansi yang memiliki API" accentColor="emerald" />
      </div>

      {/* ─── Daftar API Milik Sendiri ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-indigo-500" />
          Endpoint API Milik {user?.opd?.name || 'OPD Anda'}
        </h3>

        {myEndpoints.length > 0 ? (
          <div className="space-y-3">
            {myEndpoints.map(ep => (
              <div key={ep.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{ep.title}</span>
                    {ep.is_active ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold">AKTIF</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold">NONAKTIF</span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">/{user?.opd?.code || 'opd'}/{ep.slug}</p>
                  <div className="flex flex-wrap gap-1">
                    {(ep.method_permissions || []).map(m => (
                      <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                    ))}
                  </div>
                </div>
                <a
                  href={getFullGatewayUrl(user?.opd?.code || 'opd', ep.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Gateway
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada endpoint API yang dikelola oleh OPD Anda.</p>
            <p className="text-[11px] text-slate-400 mt-1">Gunakan menu "Kelola API Saya" untuk menambahkan endpoint baru.</p>
          </div>
        )}
      </div>
    </div>
  )
}

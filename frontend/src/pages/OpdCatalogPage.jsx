import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Building2, Globe, X, Loader2, CheckCircle, Search, ShieldCheck, Info, ExternalLink, Copy, Check
} from 'lucide-react'

const getFullGatewayUrl = (opdCode, slug) => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `${window.location.protocol}//${host}:8000/APIGATELU/${opdCode}/${slug}`
    }
  }
  return `https://ragem-api.lampungutarakab.go.id/APIGATELU/${opdCode}/${slug}`
}

const methodColor = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

export default function OpdCatalogPage() {
  const { user } = useAuth()
  const [catalogEndpoints, setCatalogEndpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCatalog, setSearchCatalog] = useState('')
  const [detailEndpoint, setDetailEndpoint] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/opd/catalog')
      setCatalogEndpoints(res.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch catalog:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const copyUrl = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredCatalog = catalogEndpoints.filter(ep =>
    ep.title?.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    ep.opd?.name?.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    ep.slug?.toLowerCase().includes(searchCatalog.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Katalog API Daerah
        </h2>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          Semua API Publik
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400">Memuat data katalog...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari endpoint atau nama OPD..."
              value={searchCatalog}
              onChange={e => setSearchCatalog(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/60 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>

          {/* Catalog Grid */}
          {filteredCatalog.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalog.map(ep => {
                const isOwner = ep.is_owner || (user?.opd_id && Number(user.opd_id) === Number(ep.opd_id))
                const gatewayUrl = getFullGatewayUrl(ep.opd?.code, ep.slug)

                return (
                  <div key={ep.id} className="group bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            onClick={() => setDetailEndpoint(ep)}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer hover:underline flex items-center gap-1.5 group/title"
                            title="Klik untuk melihat detail lengkap API"
                          >
                            <span>{ep.title}</span>
                            <Info className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover/title:opacity-100 transition-opacity shrink-0" />
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {ep.opd?.name || 'OPD'}
                          </p>
                        </div>
                        {ep.is_active ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold shrink-0">AKTIF</span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold shrink-0">NONAKTIF</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(ep.method_permissions || []).map(m => (
                          <span key={m} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${methodColor[m] || 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                            {m}
                          </span>
                        ))}
                      </div>

                      <div
                        onClick={() => setDetailEndpoint(ep)}
                        className="text-[11px] font-mono text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-800/60 truncate cursor-pointer hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300 transition-all flex items-center justify-between group/slug"
                        title="Klik untuk melihat detail API"
                      >
                        <span>/{ep.opd?.code || 'opd'}/{ep.slug}</span>
                        <Info className="w-3 h-3 opacity-0 group-hover/slug:opacity-100 transition-opacity text-blue-500 shrink-0" />
                      </div>
                    </div>

                    {/* All endpoints are publicly accessible */}
                    <div className="mt-4 flex gap-2">
                      {isOwner && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Milik Anda</span>
                        </div>
                      )}
                      <a
                        href={gatewayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Akses API</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Tidak ada endpoint API yang tersedia saat ini.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Informasi API */}
      {detailEndpoint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setDetailEndpoint(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  {detailEndpoint.opd?.name || 'OPD Daerah'}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{detailEndpoint.title}</h3>
              </div>
              <button onClick={() => setDetailEndpoint(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Instansi Pemilik</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  {detailEndpoint.opd?.name} ({detailEndpoint.opd?.code})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status Endpoint</span>
                <p className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${detailEndpoint.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className={detailEndpoint.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                    {detailEndpoint.is_active ? 'Aktif & Operasional' : 'Non-Aktif'}
                  </span>
                </p>
              </div>

              {/* Gateway URL — selalu tampil karena semua API publik */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gateway Route URL (Publik):</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline break-all text-[11px] flex items-center gap-1.5 flex-1"
                    title="Buka langsung di browser"
                  >
                    <span>{getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug)}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </a>
                  <button
                    onClick={() => copyUrl(getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug), `detail-${detailEndpoint.id}`)}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all cursor-pointer shrink-0"
                    title="Salin URL"
                  >
                    {copiedId === `detail-${detailEndpoint.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Allowed HTTP Methods */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Method HTTP yang Diizinkan:</span>
              <div className="flex flex-wrap gap-2">
                {(detailEndpoint.method_permissions || []).map(m => (
                  <span key={m} className={`text-xs font-mono font-extrabold px-3 py-1 rounded-lg border ${methodColor[m]}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">Target Upstream Service:</span>
              {detailEndpoint.target_url?.startsWith('http') ? (
                <a
                  href={detailEndpoint.target_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:underline text-[11px] flex items-center justify-between group truncate"
                >
                  <span className="truncate">{detailEndpoint.target_url}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                </a>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-[11px] truncate">
                  {detailEndpoint.target_url || 'Target internal service URL'}
                </div>
              )}
            </div>

            {/* Example JSON Payload */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">Skema Response JSON:</span>
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] overflow-x-auto leading-relaxed max-h-40">
                <code>{`{\n  "status": "success",\n  "dataset": "${detailEndpoint.title}",\n  "opd": "${detailEndpoint.opd?.name || 'OPD'}",\n  "total_records": 5,\n  "data": [ ... ]\n}`}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDetailEndpoint(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka API di Browser</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

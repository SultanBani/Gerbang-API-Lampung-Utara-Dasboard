import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Building2, Globe, Send, X, Loader2, CheckCircle, Search, ShieldCheck, Info, FileText, Code, Check, ExternalLink, Lock
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

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [detailEndpoint, setDetailEndpoint] = useState(null)
  const [requestMethods, setRequestMethods] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Toast state
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

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

  const handleSubmitRequest = async () => {
    if (!selectedEndpoint || requestMethods.length === 0) return
    setSubmitting(true)
    try {
      await api.post('/api/opd/access-requests', {
        endpoint_id: selectedEndpoint.id,
        requested_methods: requestMethods,
      })
      showToast('Permintaan akses berhasil diajukan!')
      setShowRequestModal(false)
      setSelectedEndpoint(null)
      setRequestMethods([])
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan akses.', 'error')
    } finally {
      setSubmitting(false)
    }
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
      </div>

      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-sm text-sm font-semibold animate-in slide-in-from-right duration-300 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/30 text-red-200'
            : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

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
              {filteredCatalog.map(ep => (
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

                  {(() => {
                    const isOwner = ep.is_owner || (user?.opd_id && Number(user.opd_id) === Number(ep.opd_id))
                    const status = ep.access_status || (isOwner ? 'approved' : 'none')

                    if (isOwner) {
                      return (
                        <div className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>API Milik OPD Anda</span>
                        </div>
                      )
                    }

                    if (status === 'approved') {
                      return (
                        <div className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>✓ Akses Disetujui (Siap Digunakan)</span>
                        </div>
                      )
                    }

                    if (status === 'pending') {
                      return (
                        <div className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                          <span>⏳ Menunggu Persetujuan OPD Pemilik</span>
                        </div>
                      )
                    }

                    if (status === 'rejected') {
                      return (
                        <button
                          onClick={() => { setSelectedEndpoint(ep); setRequestMethods([]); setShowRequestModal(true) }}
                          disabled={!ep.is_active}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Akses Ditolak (Ajukan Ulang)</span>
                        </button>
                      )
                    }

                    return (
                      <button
                        onClick={() => { setSelectedEndpoint(ep); setRequestMethods([]); setShowRequestModal(true) }}
                        disabled={!ep.is_active}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ajukan Akses API</span>
                      </button>
                    )
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Tidak ada endpoint API yang tersedia dari OPD lain saat ini.</p>
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
            {(() => {
              const hasAccess = detailEndpoint.is_owner || detailEndpoint.access_status === 'approved'
              return (
                <>
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

                    {hasAccess ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Gateway Route URL (Klik untuk Akses):</span>
                        <a
                          href={getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline break-all text-[11px] flex items-center gap-1.5 mt-0.5"
                          title="Buka langsung di browser"
                        >
                          <span>{getFullGatewayUrl(detailEndpoint.opd?.code, detailEndpoint.slug)}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Gateway Route URL Terproteksi 🔒</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase">
                            {detailEndpoint.access_status === 'pending' ? 'Menunggu Persetujuan' : 'Akses Belum Diizinkan'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          URL Gateway API dan Link Data hanya dapat diakses langsung apabila permohonan akses telah disetujui oleh OPD pemilik (<strong>{detailEndpoint.opd?.name}</strong>).
                        </p>
                        {detailEndpoint.access_status !== 'pending' && (
                          <button
                            onClick={() => {
                              const ep = detailEndpoint
                              setDetailEndpoint(null)
                              setSelectedEndpoint(ep)
                              setRequestMethods([])
                              setShowRequestModal(true)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer mt-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Ajukan Izin Akses API</span>
                          </button>
                        )}
                      </div>
                    )}
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
                    {hasAccess ? (
                      detailEndpoint.target_url?.startsWith('http') ? (
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
                      )
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] italic flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>🔒 Tersembunyi (Memerlukan persetujuan akses dari {detailEndpoint.opd?.name})</span>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}

            {/* Example JSON Payload */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">Skema Response JSON:</span>
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] overflow-x-auto leading-relaxed max-h-40">
                <code>{`{\n  "status": "success",\n  "dataset": "${detailEndpoint.title}",\n  "opd": "${detailEndpoint.opd?.name || 'OPD'}",\n  "total_records": 5,\n  "data": [ ... ]\n}`}</code>
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDetailEndpoint(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Tutup
              </button>
              {(() => {
                const isOwner = detailEndpoint.is_owner || (user?.opd_id && Number(user.opd_id) === Number(detailEndpoint.opd_id))
                const status = detailEndpoint.access_status || (isOwner ? 'approved' : 'none')

                if (isOwner) return null

                if (status === 'approved') {
                  return (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>✓ Akses Telah Disetujui</span>
                    </div>
                  )
                }

                if (status === 'pending') {
                  return (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                      <span>⏳ Permohonan Menunggu Persetujuan</span>
                    </div>
                  )
                }

                return (
                  <button
                    onClick={() => {
                      const ep = detailEndpoint
                      setDetailEndpoint(null)
                      setSelectedEndpoint(ep)
                      setRequestMethods([])
                      setShowRequestModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ajukan Akses API Ini</span>
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Akses API */}
      {showRequestModal && selectedEndpoint && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Ajukan Akses API
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Endpoint Info */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 space-y-1.5">
              <p className="text-xs text-slate-600 dark:text-slate-400">Endpoint Tujuan:</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEndpoint.title}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {selectedEndpoint.opd?.name}
              </p>
              <p className="text-[11px] font-mono text-slate-500">/{selectedEndpoint.opd?.code}/{selectedEndpoint.slug}</p>
            </div>

            {/* Method Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 block">
                Pilih Method yang Dibutuhkan:
              </label>
              <div className="flex flex-wrap gap-2">
                {(selectedEndpoint.method_permissions || []).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setRequestMethods(prev =>
                        prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                      )
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      requestMethods.includes(m)
                        ? methodColor[m] + ' ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-500 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {requestMethods.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">* Pilih minimal 1 method HTTP.</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={submitting || requestMethods.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

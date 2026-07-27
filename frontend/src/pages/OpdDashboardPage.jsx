import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Building2, Globe, Send, Plus, Check, X, Copy, ExternalLink,
  Shield, Clock, Key, ChevronDown, ChevronUp, Search, Loader2,
  CheckCircle, XCircle, AlertTriangle, Link2, Pencil, Trash2,
  ToggleLeft, ToggleRight
} from 'lucide-react'

const GATEWAY_BASE = 'https://ragem-api.lampungutarakab.go.id/APIGATELU'
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// ─── Method Badge Colors ──────────────────────────────────────────
const methodColor = {
  GET:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POST:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  PUT:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PATCH:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function OpdDashboardPage() {
  const { user } = useAuth()

  // ─── State ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('catalog')
  const [catalogEndpoints, setCatalogEndpoints] = useState([])
  const [myEndpoints, setMyEndpoints] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [myAccessRequests, setMyAccessRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCatalog, setSearchCatalog] = useState('')

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [requestMethods, setRequestMethods] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Endpoint form states
  const [showEndpointForm, setShowEndpointForm] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState(null)
  const [epForm, setEpForm] = useState({ title: '', slug: '', target_url: '', method_permissions: [], is_active: true })

  // Toast state
  const [toast, setToast] = useState(null)

  // Copied states
  const [copiedId, setCopiedId] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ─── Data Fetching ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Submit Access Request ────────────────────────────────
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

  // ─── Approve / Reject ─────────────────────────────────────
  const handleAction = async (id, action) => {
    try {
      await api.patch(`/api/opd/incoming-requests/${id}/${action}`)
      showToast(action === 'approve' ? 'Akses disetujui & API Key di-generate!' : 'Permintaan ditolak.')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memproses permintaan.', 'error')
    }
  }

  // ─── Endpoint CRUD ────────────────────────────────────────
  const resetEpForm = () => {
    setEpForm({ title: '', slug: '', target_url: '', method_permissions: [], is_active: true })
    setEditingEndpoint(null)
    setShowEndpointForm(false)
  }

  const handleSaveEndpoint = async () => {
    if (!epForm.title || !epForm.slug || !epForm.target_url || epForm.method_permissions.length === 0) {
      showToast('Semua field wajib diisi dan minimal 1 method dipilih.', 'error')
      return
    }
    setSubmitting(true)
    try {
      if (editingEndpoint) {
        await api.put(`/api/opd/my-endpoints/${editingEndpoint.id}`, epForm)
        showToast('Endpoint berhasil diperbarui!')
      } else {
        await api.post('/api/opd/my-endpoints', epForm)
        showToast('Endpoint baru berhasil ditambahkan!')
      }
      resetEpForm()
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan endpoint.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEndpoint = async (id) => {
    if (!confirm('Yakin ingin menghapus endpoint ini?')) return
    try {
      await api.delete(`/api/opd/my-endpoints/${id}`)
      showToast('Endpoint berhasil dihapus.')
      fetchData()
    } catch (err) {
      showToast('Gagal menghapus endpoint.', 'error')
    }
  }

  const handleEditEndpoint = (ep) => {
    setEpForm({
      title: ep.title,
      slug: ep.slug,
      target_url: ep.target_url,
      method_permissions: ep.method_permissions || [],
      is_active: ep.is_active,
    })
    setEditingEndpoint(ep)
    setShowEndpointForm(true)
  }

  const toggleMethodPermission = (method) => {
    setEpForm(prev => ({
      ...prev,
      method_permissions: prev.method_permissions.includes(method)
        ? prev.method_permissions.filter(m => m !== method)
        : [...prev.method_permissions, method]
    }))
  }

  // ─── Copy to Clipboard ────────────────────────────────────
  const copyUrl = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ─── Filter Catalog ───────────────────────────────────────
  const filteredCatalog = catalogEndpoints.filter(ep =>
    ep.title?.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    ep.opd?.name?.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    ep.slug?.toLowerCase().includes(searchCatalog.toLowerCase())
  )

  // ─── Status Badge ─────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const styles = {
      pending:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
      approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    }
    const icons = {
      pending:  <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
        {icons[status]} {status?.toUpperCase()}
      </span>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ─── Toast Notification ──────────────────────────────── */}
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/70 via-indigo-900/50 to-slate-900 border border-blue-500/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              Portal OPD — {user?.opd?.name || 'Instansi OPD'}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Selamat datang, {user?.name || 'Pengguna OPD'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Kelola endpoint API milik instansi Anda, ajukan akses ke API OPD lain, dan pantau status permintaan akses interoperabilitas daerah.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/60 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kode OPD</div>
              <div className="text-sm font-bold text-blue-400 mt-0.5 font-mono">{user?.opd?.code || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
        {[
          { key: 'catalog', label: 'Katalog API', icon: Globe, count: catalogEndpoints.length },
          { key: 'manage', label: 'Kelola API Saya', icon: Shield, count: myEndpoints.length },
          { key: 'my-requests', label: 'Status Pengajuan', icon: Send, count: myAccessRequests.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-800'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400">Memuat data...</span>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 1: KATALOG API OPD LAIN                        */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari endpoint atau nama OPD..."
                  value={searchCatalog}
                  onChange={e => setSearchCatalog(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              {/* Catalog Grid */}
              {filteredCatalog.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCatalog.map(ep => (
                    <div key={ep.id} className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{ep.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {ep.opd?.name || 'OPD'}
                            </p>
                          </div>
                          {ep.is_active ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">AKTIF</span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold shrink-0">NONAKTIF</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(ep.method_permissions || []).map(m => (
                            <span key={m} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${methodColor[m] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                              {m}
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-800/60 truncate">
                          /{ep.opd?.code || 'opd'}/{ep.slug}
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedEndpoint(ep); setRequestMethods([]); setShowRequestModal(true) }}
                        disabled={!ep.is_active}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/20 hover:border-blue-500/40 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ajukan Akses API
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Tidak ada endpoint API yang tersedia dari OPD lain.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 2: KELOLA API MILIK SENDIRI                    */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'manage' && (
            <div className="space-y-6">

              {/* ── Form Tambah/Edit Endpoint ──────────────── */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" />
                    {showEndpointForm ? (editingEndpoint ? 'Edit Endpoint' : 'Tambah Endpoint Baru') : 'Endpoint API Milik OPD Anda'}
                  </h3>
                  {!showEndpointForm ? (
                    <button
                      onClick={() => { resetEpForm(); setShowEndpointForm(true) }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Endpoint
                    </button>
                  ) : (
                    <button onClick={resetEpForm} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showEndpointForm && (
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Judul Endpoint</label>
                        <input
                          value={epForm.title}
                          onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Data Pegawai"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Slug (URL Path)</label>
                        <input
                          value={epForm.slug}
                          onChange={e => setEpForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                          placeholder="e.g. data-pegawai"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Target URL (Upstream)</label>
                      <input
                        value={epForm.target_url}
                        onChange={e => setEpForm(p => ({ ...p, target_url: e.target.value }))}
                        placeholder="e.g. https://simpeg.lampungutarakab.go.id/api/pegawai"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-2 block">Method yang Didukung</label>
                      <div className="flex flex-wrap gap-2">
                        {HTTP_METHODS.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => toggleMethodPermission(m)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                              epForm.method_permissions.includes(m)
                                ? methodColor[m] + ' ring-1 ring-offset-1 ring-offset-slate-900'
                                : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => setEpForm(p => ({ ...p, is_active: !p.is_active }))}
                          className="cursor-pointer"
                        >
                          {epForm.is_active
                            ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                            : <ToggleLeft className="w-6 h-6 text-slate-500" />
                          }
                        </button>
                        Endpoint Aktif
                      </label>
                      <div className="flex gap-2">
                        <button onClick={resetEpForm} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer">Batal</button>
                        <button
                          onClick={handleSaveEndpoint}
                          disabled={submitting}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
                        >
                          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {editingEndpoint ? 'Perbarui' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── My Endpoints Table ──────────────────── */}
                {!showEndpointForm && (
                  <div className="space-y-3">
                    {myEndpoints.length > 0 ? myEndpoints.map(ep => (
                      <div key={ep.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{ep.title}</h4>
                              {ep.is_active ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">AKTIF</span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">NONAKTIF</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(ep.method_permissions || []).map(m => (
                                <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">{ep.target_url}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => handleEditEndpoint(ep)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all cursor-pointer" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteEndpoint(ep.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all cursor-pointer" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-slate-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Belum ada endpoint. Klik "Tambah Endpoint" untuk mulai.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Permintaan Akses Masuk ─────────────────── */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Permintaan Akses Masuk
                  {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {incomingRequests.filter(r => r.status === 'pending').length} PENDING
                    </span>
                  )}
                </h3>

                {incomingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {incomingRequests.map(req => (
                      <div key={req.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">{req.requestor_opd?.name || 'OPD Pemohon'}</span>
                              <StatusBadge status={req.status} />
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Meminta akses ke: <span className="font-semibold text-slate-300">{req.endpoint?.title || '-'}</span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {(req.requested_methods || []).map(m => (
                                <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                              ))}
                            </div>
                            {/* Show generated API Key & Gateway URL if approved */}
                            {req.status === 'approved' && req.api_key && (
                              <div className="mt-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Key className="w-3 h-3 text-emerald-400" />
                                  <span className="text-[10px] font-bold text-emerald-400">API KEY GENERATED</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/80 rounded-lg px-3 py-2 border border-slate-800">
                                  <code className="text-[11px] font-mono text-amber-300 truncate flex-1">{req.api_key}</code>
                                  <button onClick={() => copyUrl(req.api_key, `key-${req.id}`)} className="p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer shrink-0">
                                    {copiedId === `key-${req.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleAction(req.id, 'approve')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/25 transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'reject')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-600/25 transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Belum ada permintaan akses masuk ke endpoint Anda.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 3: STATUS PENGAJUAN SAYA + GATEWAY URL         */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              {myAccessRequests.length > 0 ? myAccessRequests.map(req => (
                <div key={req.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{req.endpoint?.title || 'Endpoint'}</h4>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Pemilik: {req.endpoint?.opd?.name || 'OPD'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(req.requested_methods || []).map(m => (
                            <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                          ))}
                        </div>
                      </div>
                      {req.expires_at && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-500">Kedaluwarsa</div>
                          <div className="text-[11px] text-slate-300 font-mono">{new Date(req.expires_at).toLocaleDateString('id-ID')}</div>
                        </div>
                      )}
                    </div>

                    {/* Gateway URL — siap dicopy untuk Chrome */}
                    {req.status === 'approved' && req.api_key && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950/60 border border-emerald-500/20 space-y-3">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">URL Gateway Siap Akses</span>
                        </div>

                        {/* Full Gateway URL */}
                        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 group">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL (Akses via Chrome)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] font-mono text-blue-300 break-all flex-1 leading-relaxed">
                              {GATEWAY_BASE}/{req.endpoint?.opd?.code || 'opd'}/{req.endpoint?.slug || 'slug'}?api_key={req.api_key}
                            </code>
                            <button
                              onClick={() => copyUrl(
                                `${GATEWAY_BASE}/${req.endpoint?.opd?.code || 'opd'}/${req.endpoint?.slug || 'slug'}?api_key=${req.api_key}`,
                                `url-${req.id}`
                              )}
                              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                              title="Salin URL"
                            >
                              {copiedId === `url-${req.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* API Key */}
                        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Key className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">API Key</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] font-mono text-amber-300 truncate flex-1">{req.api_key}</code>
                            <button
                              onClick={() => copyUrl(req.api_key, `apikey-${req.id}`)}
                              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                              title="Salin API Key"
                            >
                              {copiedId === `apikey-${req.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Header Alternative */}
                        <div className="text-[11px] text-slate-500 px-1">
                          <span className="font-semibold text-slate-400">Alternatif Header:</span>{' '}
                          <code className="text-blue-400">X-API-KEY: {req.api_key}</code>
                        </div>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu persetujuan dari pemilik endpoint...
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" />
                        Permintaan akses ditolak oleh pemilik endpoint.
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 text-slate-500">
                  <Send className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Belum ada pengajuan akses. Buka Katalog API untuk mengajukan.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: AJUKAN AKSES API                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showRequestModal && selectedEndpoint && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Ajukan Akses API
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Endpoint Info */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <p className="text-xs text-slate-400">Endpoint Tujuan:</p>
              <p className="text-sm font-bold text-white">{selectedEndpoint.title}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {selectedEndpoint.opd?.name}
              </p>
              <p className="text-[11px] font-mono text-slate-500">/{selectedEndpoint.opd?.code}/{selectedEndpoint.slug}</p>
            </div>

            {/* Method Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2.5 block">
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
                        ? methodColor[m] + ' ring-2 ring-offset-1 ring-offset-slate-900 shadow-lg'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {requestMethods.length === 0 && (
                <p className="text-[11px] text-amber-400 mt-2">* Pilih minimal 1 method HTTP.</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
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

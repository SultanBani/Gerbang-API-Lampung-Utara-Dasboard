import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import {
  Shield, Plus, Check, X, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertTriangle
} from 'lucide-react'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const methodColor = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

export default function OpdManageApiPage() {
  const [myEndpoints, setMyEndpoints] = useState([])
  const [loading, setLoading] = useState(true)

  // Endpoint form states
  const [showEndpointForm, setShowEndpointForm] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState(null)
  const [epForm, setEpForm] = useState({ title: '', slug: '', target_url: '', method_permissions: [], is_active: true })
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
      const res = await api.get('/api/opd/my-endpoints')
      setMyEndpoints(res.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch endpoints:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" /> Kelola API Saya
        </h2>
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400">Memuat endpoint...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              {showEndpointForm ? (editingEndpoint ? 'Edit Endpoint' : 'Tambah Endpoint Baru') : 'Daftar Endpoint API Instansi Anda'}
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
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1.5 block">Judul Endpoint</label>
                  <input
                    value={epForm.title}
                    onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Data Pegawai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1.5 block">Slug (URL Path)</label>
                  <input
                    value={epForm.slug}
                    onChange={e => setEpForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    placeholder="e.g. data-pegawai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1.5 block">Target URL (Upstream)</label>
                <input
                  value={epForm.target_url}
                  onChange={e => setEpForm(p => ({ ...p, target_url: e.target.value }))}
                  placeholder="e.g. https://simpeg.lampungutarakab.go.id/api/pegawai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-2 block">Method yang Didukung</label>
                <div className="flex flex-wrap gap-2">
                  {HTTP_METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMethodPermission(m)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                        epForm.method_permissions.includes(m)
                          ? methodColor[m] + ' ring-1 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-500 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setEpForm(p => ({ ...p, is_active: !p.is_active }))}
                    className="cursor-pointer"
                  >
                    {epForm.is_active
                      ? <ToggleRight className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                      : <ToggleLeft className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    }
                  </button>
                  Endpoint Aktif
                </label>
                <div className="flex gap-2">
                  <button onClick={resetEpForm} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">Batal</button>
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

          {!showEndpointForm && (
            <div className="space-y-3 mt-4">
              {myEndpoints.length > 0 ? myEndpoints.map(ep => (
                <div key={ep.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ep.title}</h4>
                        {ep.is_active ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold">AKTIF</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 font-bold">NONAKTIF</span>
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
                      <button onClick={() => handleEditEndpoint(ep)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteEndpoint(ep.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" title="Hapus">
                        <Trash2 className="w-4 h-4" />
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
      )}
    </div>
  )
}

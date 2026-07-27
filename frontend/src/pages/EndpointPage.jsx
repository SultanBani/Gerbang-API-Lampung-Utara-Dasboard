import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Plus, Trash2, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

export default function EndpointPage() {
  const { endpoints, fetchEndpoints, createEndpoint, deleteEndpoint, loading } = useApiGateway()

  const [searchQuery, setSearchQuery]   = useState('')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterTag, setFilterTag]       = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [toast, setToast]               = useState('')

  const [newForm, setNewForm] = useState({
    opd_id: '', method_permissions: ['GET'], url: '', target_url: '', is_active: true
  })

  const { opds, fetchOpds } = useApiGateway()

  useEffect(() => {
    fetchEndpoints()
    fetchOpds()
  }, [fetchEndpoints, fetchOpds])

  const filteredEndpoints = useMemo(() => {
      const q = searchQuery.toLowerCase()
      const matchQuery =
        ep.title?.toLowerCase().includes(q) ||
        ep.slug?.toLowerCase().includes(q) ||
        ep.target_url?.toLowerCase().includes(q)
      return matchQuery
    })
  }, [endpoints, searchQuery])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const applyAiRecommendation = () => {
    setNewForm({ opd_id: opds[0]?.id || '', method_permissions: ['GET'], title: 'API Data Kependudukan (NIK)', slug: 'penduduk-nik', target_url: 'http://internal.service/api/nik', is_active: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createEndpoint(newForm)
      setShowAddModal(false)
      setNewForm({ opd_id: '', method_permissions: ['GET'], title: '', slug: '', target_url: '', is_active: true })
      showToast('Endpoint berhasil didaftarkan!')
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'Gagal menyimpan endpoint.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, label) => {
    if (!confirm(`Hapus endpoint [${label}]?`)) return
    try {
      await deleteEndpoint(id)
      showToast(`Endpoint [${label}] berhasil dihapus.`)
    } catch { showToast('Gagal menghapus endpoint.') }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Cari slug endpoint, judul, atau target URL..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" />
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /><span>Tambah Endpoint API</span>
        </button>
      </div>

      {/* Endpoints Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">OPD Pemilik</th>
                <th className="py-3.5 px-5">Judul & Slug</th>
                <th className="py-3.5 px-5">Target URL (Internal)</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading.endpoints
                ? <tr><td colSpan="8" className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                : filteredEndpoints.map((ep, index) => (
                    <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 text-slate-400 font-mono font-bold">{index + 1}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ep.opd?.name ?? '—'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ep.opd?.code}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{ep.title}</div>
                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 mt-1 inline-block">/APIGATELU/{ep.opd?.code}/{ep.slug}</code>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]" title={ep.target_url}>
                        {ep.target_url}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1">
                          {(ep.method_permissions || []).map((method) => (
                            <span key={method} className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono border ${
                              method === 'GET'    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                              method === 'POST'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                              method === 'PUT'    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                              method === 'PATCH'  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' :
                              'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                            }`}>{method}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 ${
                          ep.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ep.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {ep.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button onClick={() => handleDelete(ep.id, `${ep.title}`)} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /><span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))
              }
              {!loading.endpoints && filteredEndpoints.length === 0 && (
                <tr><td colSpan="8" className="py-12 text-center text-slate-400">Tidak ada endpoint yang ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Endpoint */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">⚙️ Registrasi Endpoint API Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  <strong className="block font-bold">🤖 AI Endpoint Recommender</strong>
                  <span className="text-slate-500 dark:text-slate-400">Klik untuk isi formulir dengan rekomendasi otomatis.</span>
                </div>
                <button type="button" onClick={applyAiRecommendation} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /><span>Rekomendasi AI</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">OPD Pemilik *</label>
                  <select value={newForm.opd_id} onChange={e => setNewForm(p => ({ ...p, opd_id: e.target.value }))} required className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200">
                    <option value="">-- Pilih OPD --</option>
                    {opds.map(opd => (
                      <option key={opd.id} value={opd.id}>{opd.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Judul Endpoint *</label>
                  <input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} required type="text" placeholder="API Data Kependudukan" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">URL Slug *</label>
                  <input value={newForm.slug} onChange={e => setNewForm(p => ({ ...p, slug: e.target.value }))} required type="text" placeholder="penduduk-nik" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200" />
                  <p className="text-[10px] text-slate-500 mt-1">Akan diakses via: /APIGATELU/kode-opd/<strong>slug</strong></p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Target URL (Internal) *</label>
                  <input value={newForm.target_url} onChange={e => setNewForm(p => ({ ...p, target_url: e.target.value }))} required type="url" placeholder="http://internal-service/api/v1/..." className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Method Permissions (Gunakan Ctrl/Cmd untuk pilih multiple) *</label>
                <select multiple value={newForm.method_permissions} onChange={e => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setNewForm(p => ({ ...p, method_permissions: options }))
                }} required className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200">
                  {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input checked={newForm.is_active} onChange={e => setNewForm(p => ({ ...p, is_active: e.target.checked }))} type="checkbox" id="isActive" className="rounded text-indigo-600 focus:ring-0" />
                <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Endpoint Aktif</label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-colors cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Menyimpan...' : 'Daftarkan Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /><span>{toast}</span>
        </div>
      )}
    </div>
  )
}

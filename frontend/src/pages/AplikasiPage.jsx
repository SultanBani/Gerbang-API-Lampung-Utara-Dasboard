import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Plus, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react'

export default function AplikasiPage() {
  const { applications, fetchApplications, createApplication, deleteApplication, loading } = useApiGateway()

  const [searchQuery, setSearchQuery]   = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOpd, setFilterOpd]       = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [toast, setToast]               = useState('')

  const [newForm, setNewForm] = useState({
    name: '', opd: '', pic: '', phone: '', description: '', status: 'active'
  })

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const opdList = useMemo(() => [...new Set(applications.map(a => a.opd))].sort(), [applications])

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const q = searchQuery.toLowerCase()
      const matchQuery =
        app.name?.toLowerCase().includes(q) ||
        app.opd?.toLowerCase().includes(q) ||
        app.pic_name?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || app.status === filterStatus
      const matchOpd    = filterOpd === 'all' || app.opd === filterOpd
      return matchQuery && matchStatus && matchOpd
    })
  }, [applications, searchQuery, filterStatus, filterOpd])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createApplication(newForm)
      setShowAddModal(false)
      setNewForm({ name: '', opd: '', pic: '', phone: '', description: '', status: 'active' })
      showToast('Aplikasi berhasil ditambahkan!')
    } catch {
      showToast('Gagal menyimpan aplikasi. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus aplikasi "${name}"? Seluruh API Key dan log terkait akan terpengaruh.`)) return
    try {
      await deleteApplication(id)
      showToast(`Aplikasi "${name}" berhasil dihapus.`)
    } catch {
      showToast('Gagal menghapus aplikasi.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Cari nama aplikasi, OPD, atau PIC..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm">
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>

          <select value={filterOpd} onChange={e => setFilterOpd(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm">
            <option value="all">Semua OPD</option>
            {opdList.map(opd => <option key={opd} value={opd}>{opd}</option>)}
          </select>
        </div>

        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /><span>Tambah Aplikasi Baru</span>
        </button>
      </div>

      {/* Applications Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Nama Aplikasi</th>
                <th className="py-3.5 px-5">OPD / Instansi</th>
                <th className="py-3.5 px-5">PIC / Kontak</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Tanggal Didaftarkan</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading.applications
                ? <tr><td colSpan="7" className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                : filteredApps.map((app, index) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 text-slate-400 font-mono font-bold">{index + 1}</td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{app.name}</div>
                        {app.description && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] truncate">{app.description}</div>}
                      </td>
                      <td className="py-4 px-5 max-w-[240px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug break-words">
                          {app.opd}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{app.pic_name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{app.pic_phone ?? '—'}</div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 ${
                          app.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {app.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {app.created_at?.split('T')[0] ?? app.created_at}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button onClick={() => handleDelete(app.id, app.name)} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /><span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))
              }
              {!loading.applications && filteredApps.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-slate-400">Tidak ada aplikasi yang sesuai dengan pencarian atau filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Aplikasi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">🗂️ Tambah Aplikasi OPD Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama Singkat Aplikasi *</label>
                  <input value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} required type="text" placeholder="SIMPEG" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">OPD / Pengelola *</label>
                  <input value={newForm.opd} onChange={e => setNewForm(p => ({ ...p, opd: e.target.value }))} required type="text" placeholder="BKPSDM" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama PIC *</label>
                  <input value={newForm.pic} onChange={e => setNewForm(p => ({ ...p, pic: e.target.value }))} required type="text" placeholder="Budi Santoso" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nomor WhatsApp/Kontak</label>
                  <input value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} type="text" placeholder="0812-xxxx-xxxx" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi Aplikasi</label>
                <textarea value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Jelaskan fungsi integrasi aplikasi ini..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200"></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-colors cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Menyimpan...' : 'Simpan Aplikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /><span>{toast}</span>
        </div>
      )}
    </div>
  )
}

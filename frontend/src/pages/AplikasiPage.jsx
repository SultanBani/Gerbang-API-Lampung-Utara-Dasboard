import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Plus, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react'

export default function AplikasiPage() {
  const { opds, fetchOpds, createOpd, deleteOpd, loading } = useApiGateway()

  const [searchQuery, setSearchQuery]   = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOpd, setFilterOpd]       = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [toast, setToast]               = useState('')

  const [newForm, setNewForm] = useState({
    name: '', opd: '', pic: '', phone: '', description: '', status: 'active'
  })

  useEffect(() => { fetchOpds() }, [fetchOpds])

  const opdList = useMemo(() => [...new Set(opds.map(a => a.code))].sort(), [opds])

  const filteredApps = useMemo(() => {
    return opds.filter(app => {
      const q = searchQuery.toLowerCase()
      const matchQuery =
        app.name?.toLowerCase().includes(q) ||
        app.opd?.toLowerCase().includes(q) ||
        app.pic_name?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || app.status === filterStatus
      const matchOpd    = filterOpd === 'all' || app.code === filterOpd
      return matchQuery && matchOpd
    })
  }, [opds, searchQuery, filterOpd])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createOpd(newForm)
      setShowAddModal(false)
      setNewForm({ name: '', code: '', description: '' })
      showToast('OPD berhasil ditambahkan!')
    } catch {
      showToast('Gagal menyimpan OPD. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus OPD "${name}"? Seluruh API Key dan log terkait akan terpengaruh.`)) return
    try {
      await deleteOpd(id)
      showToast(`OPD "${name}" berhasil dihapus.`)
    } catch {
      showToast('Gagal menghapus OPD.')
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
              placeholder="Cari nama OPD atau kode..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>



          <select value={filterOpd} onChange={e => setFilterOpd(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm">
            <option value="all">Semua OPD</option>
            {opdList.map(opd => <option key={opd} value={opd}>{opd}</option>)}
          </select>
        </div>

        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /><span>Tambah OPD Baru</span>
        </button>
      </div>

      {/* Applications Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Nama OPD</th>
                <th className="py-3.5 px-5">Kode OPD</th>
                <th className="py-3.5 px-5">Deskripsi</th>
                <th className="py-3.5 px-5 text-center">Jml Endpoint</th>
                <th className="py-3.5 px-5 text-center">Jml User</th>
                <th className="py-3.5 px-5">Tanggal Didaftarkan</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading.opds
                ? <tr><td colSpan="7" className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                : filteredApps.map((app, index) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 text-slate-400 font-mono font-bold">{index + 1}</td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{app.name}</div>
                      </td>
                      <td className="py-4 px-5 max-w-[240px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug break-words">
                          {app.code}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] truncate">{app.description || '—'}</div>
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {app.endpoints_count ?? 0}
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {app.users_count ?? 0}
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
              {!loading.opds && filteredApps.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-slate-400">Tidak ada OPD yang sesuai dengan pencarian atau filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Aplikasi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">🗂️ Tambah OPD Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama OPD *</label>
                  <input value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} required type="text" placeholder="Dinas Kependudukan dan Pencatatan Sipil" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Kode OPD *</label>
                  <input value={newForm.code} onChange={e => setNewForm(p => ({ ...p, code: e.target.value }))} required type="text" placeholder="disdukcapil" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi OPD</label>
                <textarea value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Jelaskan fungsi OPD ini..." className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200"></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-colors cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Menyimpan...' : 'Simpan OPD'}
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

import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Plus, Trash2, X } from 'lucide-react'

export default function AplikasiPage() {
  const { applications, addApplication, deleteApplication } = useApiGateway()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOpd, setFilterOpd] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const [newForm, setNewForm] = useState({
    name: '',
    fullName: '',
    opd: '',
    pic: '',
    phone: '',
    description: '',
    status: 'active'
  })

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchQuery =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.opd.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.pic.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus = filterStatus === 'all' || app.status === filterStatus
      const matchOpd = filterOpd === 'all' || app.opd === filterOpd

      return matchQuery && matchStatus && matchOpd
    })
  }, [applications, searchQuery, filterStatus, filterOpd])

  const handleSubmit = (e) => {
    e.preventDefault()
    addApplication(newForm)
    setShowAddModal(false)
    setNewForm({ name: '', fullName: '', opd: '', pic: '', phone: '', description: '', status: 'active' })
  }

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus aplikasi ini dari daftar?')) {
      deleteApplication(id)
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

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>

          <select
            value={filterOpd}
            onChange={e => setFilterOpd(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="all">Semua OPD</option>
            <option value="BKPSDM">BKPSDM</option>
            <option value="Diskominfo">Diskominfo</option>
            <option value="Disdukcapil">Disdukcapil</option>
            <option value="BPKAD">BPKAD</option>
            <option value="Dinas Pendidikan">Dinas Pendidikan</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aplikasi Baru</span>
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
              {filteredApps.map((app, index) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-mono font-bold">{index + 1}</td>
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{app.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{app.fullName}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700/60">
                      {app.opd}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{app.pic}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{app.phone}</div>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 ${
                        app.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`}></span>
                      <span>{app.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{app.createdAt}</td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Tidak ada aplikasi yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Aplikasi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🗂️</span> Tambah Aplikasi OPD Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama Singkat Aplikasi *</label>
                  <input
                    value={newForm.name}
                    onChange={e => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    type="text"
                    placeholder="Contoh: SIMPEG"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">OPD / Pengelola *</label>
                  <input
                    value={newForm.opd}
                    onChange={e => setNewForm(prev => ({ ...prev, opd: e.target.value }))}
                    required
                    type="text"
                    placeholder="Contoh: BKPSDM"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama Lengkap Sistem</label>
                <input
                  value={newForm.fullName}
                  onChange={e => setNewForm(prev => ({ ...prev, fullName: e.target.value }))}
                  type="text"
                  placeholder="Contoh: Sistem Informasi Kepegawaian Daerah"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama PIC *</label>
                  <input
                    value={newForm.pic}
                    onChange={e => setNewForm(prev => ({ ...prev, pic: e.target.value }))}
                    required
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nomor WhatsApp/Kontak</label>
                  <input
                    value={newForm.phone}
                    onChange={e => setNewForm(prev => ({ ...prev, phone: e.target.value }))}
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi Aplikasi</label>
                <textarea
                  value={newForm.description}
                  onChange={e => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Jelaskan fungsi integrasi aplikasi ini..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
                >
                  Simpan Aplikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

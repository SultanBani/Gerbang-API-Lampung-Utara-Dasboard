import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Search, Plus, Trash2, X, Sparkles } from 'lucide-react'

export default function EndpointPage() {
  const { endpoints, addEndpoint, deleteEndpoint } = useApiGateway()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const [newForm, setNewForm] = useState({
    method: 'GET',
    url: '',
    description: '',
    tag: '',
    isAuthRequired: true,
    rateLimit: 60
  })

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(ep => {
      const matchQuery =
        ep.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchMethod = filterMethod === 'all' || ep.method === filterMethod
      const matchTag = filterTag === 'all' || ep.tag === filterTag

      return matchQuery && matchMethod && matchTag
    })
  }, [endpoints, searchQuery, filterMethod, filterTag])

  const applyAiRecommendation = () => {
    setNewForm({
      method: 'GET',
      url: '/api/penduduk/nik',
      description: 'Ambil data kependudukan berdasarkan NIK secara real-time dari SIAK',
      tag: 'Penduduk',
      isAuthRequired: true,
      rateLimit: 50
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addEndpoint(newForm)
    setShowAddModal(false)
    setNewForm({ method: 'GET', url: '', description: '', tag: '', isAuthRequired: true, rateLimit: 60 })
  }

  const handleDelete = (id) => {
    if (confirm('Hapus registrasi endpoint ini?')) {
      deleteEndpoint(id)
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
              placeholder="Cari URL endpoint atau deskripsi..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>

          <select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="all">Semua Method</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="all">Semua Tag</option>
            <option value="Pegawai">Pegawai</option>
            <option value="Auth">Auth</option>
            <option value="OPD">OPD</option>
            <option value="Penduduk">Penduduk</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Endpoint API</span>
        </button>
      </div>

      {/* Endpoints Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">URL Endpoint</th>
                <th className="py-3.5 px-5">Deskripsi Fitur</th>
                <th className="py-3.5 px-5">Tag Group</th>
                <th className="py-3.5 px-5 text-center">Auth API Key</th>
                <th className="py-3.5 px-5 text-center">Rate Limit</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEndpoints.map((ep, index) => (
                <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-mono font-bold">{index + 1}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono border ${
                        ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                        ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                        ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-900 dark:text-slate-200 font-bold text-xs">
                    <code>{ep.url}</code>
                  </td>
                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300 max-w-xs leading-relaxed">{ep.description}</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
                      {ep.tag}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className={ep.isAuthRequired ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                      {ep.isAuthRequired ? '✓ Wajib' : '✗ Publik'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center font-mono text-slate-600 dark:text-slate-300">
                    {ep.rateLimit} req/mnt
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleDelete(ep.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEndpoints.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Tidak ada endpoint yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Endpoint */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⚙️</span> Registrasi Endpoint API Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* AI Recommendation Helper Box */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  <strong className="block font-bold">🤖 AI Endpoint Recommender</strong>
                  <span className="text-slate-500 dark:text-slate-400">Ketik nama fitur lalu dapatkan rekomendasi otomatis URL & Method.</span>
                </div>
                <button
                  type="button"
                  onClick={applyAiRecommendation}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Rekomendasi AI</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Method *</label>
                  <select
                    value={newForm.method}
                    onChange={e => setNewForm(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">URL Endpoint *</label>
                  <input
                    value={newForm.url}
                    onChange={e => setNewForm(prev => ({ ...prev, url: e.target.value }))}
                    required
                    type="text"
                    placeholder="/api/nama-fitur"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tag Group *</label>
                  <input
                    value={newForm.tag}
                    onChange={e => setNewForm(prev => ({ ...prev, tag: e.target.value }))}
                    required
                    type="text"
                    placeholder="Contoh: Pegawai / Auth"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Rate Limit (req/mnt) *</label>
                  <input
                    value={newForm.rateLimit}
                    onChange={e => setNewForm(prev => ({ ...prev, rateLimit: Number(e.target.value) }))}
                    required
                    type="number"
                    placeholder="60"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi Fitur</label>
                <textarea
                  value={newForm.description}
                  onChange={e => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Deskripsikan fungsi endpoint ini secara jelas..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  checked={newForm.isAuthRequired}
                  onChange={e => setNewForm(prev => ({ ...prev, isAuthRequired: e.target.checked }))}
                  type="checkbox"
                  id="authReq"
                  className="rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="authReq" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Wajib Menggunakan API Key / Token Authentication
                </label>
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-colors cursor-pointer"
                >
                  Daftarkan Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import {
  Shield, Plus, Check, X, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2,
  CheckCircle, AlertTriangle, ExternalLink, Copy, HelpCircle, Server, Globe, Link2, Sparkles, XCircle, FileSpreadsheet, FileText, Upload
} from 'lucide-react'

const HTTP_METHODS = [
  { name: 'GET', desc: 'Membaca / Mengambil Data' },
  { name: 'POST', desc: 'Menambah Data Baru' },
  { name: 'PUT', desc: 'Mengubah Seluruh Data' },
  { name: 'PATCH', desc: 'Memperbarui Sebagian Data' },
  { name: 'DELETE', desc: 'Menghapus Data' },
]

const methodColor = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

const getGatewayBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `${window.location.protocol}//${host}:8000/APIGATELU`
    }
  }
  return 'https://ragem-api.lampungutarakab.go.id/APIGATELU'
}

export default function OpdManageApiPage() {
  const [myEndpoints, setMyEndpoints] = useState([])
  const [loading, setLoading] = useState(true)

  // Endpoint form states
  const [showEndpointForm, setShowEndpointForm] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState(null)
  
  // Data source toggle: 'file' | 'url'
  const [sourceType, setSourceType] = useState('file')
  const [selectedFile, setSelectedFile] = useState(null)
  
  const [epForm, setEpForm] = useState({ title: '', slug: '', target_url: '', method_permissions: ['GET'], is_active: true })
  const [submitting, setSubmitting] = useState(false)

  // Toast & Copy Notification
  const [toast, setToast] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
    setEpForm({ title: '', slug: '', target_url: '', method_permissions: ['GET'], is_active: true })
    setSelectedFile(null)
    setSourceType('file')
    setEditingEndpoint(null)
    setShowEndpointForm(false)
  }

  const handleSaveEndpoint = async () => {
    if (!epForm.title.trim()) {
      showToast('Judul API wajib diisi.', 'error')
      return
    }
    if (!epForm.slug.trim()) {
      showToast('Slug (Kata kunci URL) wajib diisi.', 'error')
      return
    }

    if (sourceType === 'file' && !selectedFile && !editingEndpoint) {
      showToast('Pilih file CSV / PDF yang ingin diunggah.', 'error')
      return
    }

    if (sourceType === 'url' && !epForm.target_url.trim()) {
      showToast('Target URL Service wajib diisi.', 'error')
      return
    }

    if (epForm.method_permissions.length === 0) {
      showToast('Pilih minimal 1 Method HTTP yang diizinkan (misal: GET).', 'error')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', epForm.title)
      formData.append('slug', epForm.slug)
      formData.append('method_permissions', JSON.stringify(epForm.method_permissions))
      formData.append('is_active', epForm.is_active ? '1' : '0')

      if (sourceType === 'file' && selectedFile) {
        formData.append('file', selectedFile)
      } else if (epForm.target_url) {
        formData.append('target_url', epForm.target_url)
      }

      if (editingEndpoint) {
        formData.append('_method', 'PUT')
        await api.post(`/api/opd/my-endpoints/${editingEndpoint.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('API berhasil diperbarui!')
      } else {
        await api.post('/api/opd/my-endpoints', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('API Baru & File berhasil dipublikasikan ke Katalog!')
      }
      resetEpForm()
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data API.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEndpoint = async (id, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus API "${title}"?`)) return
    try {
      await api.delete(`/api/opd/my-endpoints/${id}`)
      showToast('API berhasil dihapus.')
      fetchData()
    } catch (err) {
      showToast('Gagal menghapus API.', 'error')
    }
  }

  const handleEditEndpoint = (ep) => {
    setEpForm({
      title: ep.title || '',
      slug: ep.slug || '',
      target_url: ep.target_url || '',
      method_permissions: ep.method_permissions || ['GET'],
      is_active: ep.is_active ?? true,
    })
    setSourceType(ep.target_url?.includes('/storage/') ? 'file' : 'url')
    setSelectedFile(null)
    setEditingEndpoint(ep)
    setShowEndpointForm(true)
  }

  const toggleMethodPermission = (methodName) => {
    setEpForm(prev => ({
      ...prev,
      method_permissions: prev.method_permissions.includes(methodName)
        ? prev.method_permissions.filter(m => m !== methodName)
        : [...prev.method_permissions, methodName]
    }))
  }

  const gatewayBase = getGatewayBaseUrl()

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-bold animate-in slide-in-from-right duration-300 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/40 text-red-200'
            : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header & Add Action */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Kelola API Saya
        </h2>

        {!showEndpointForm && (
          <button
            onClick={() => { resetEpForm(); setShowEndpointForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-blue-600/25 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah API Baru</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          <span className="ml-3 text-xs font-semibold text-slate-500">Memuat daftar API milik instansi Anda...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* USER-FRIENDLY ADD / EDIT FORM MODAL CARD WITH FILE UPLOAD */}
          {showEndpointForm && (
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {editingEndpoint ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {editingEndpoint ? 'Edit Data Service API' : 'Upload File / Pendaftaran Service API Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Upload file CSV/PDF Anda atau isi URL server asli</p>
                  </div>
                </div>
                <button onClick={resetEpForm} className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-5">
                {/* 1. Nama / Judul API */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    1. Nama / Judul Layanan API <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Nama deskriptif dataset atau layanan data instansi Anda yang akan tampil di Katalog API Daerah.</p>
                  <input
                    type="text"
                    value={epForm.title}
                    onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Contoh: Jumlah Pendapatan Asli Daerah (PAD) 2023-2024"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* 2. Slug URL & Live Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      2. Kata Kunci URL (Slug) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">Gunakan huruf kecil tanpa spasi (dipisahkan tanda strip `-`).</p>
                    <input
                      type="text"
                      value={epForm.slug}
                      onChange={e => setEpForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="Contoh: pendapatan-asli-daerah"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Live Gateway Preview */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      Preview URL Gateway Output JSON:
                    </span>
                    <p className="text-[11px] font-mono text-slate-800 dark:text-slate-200 break-all font-bold">
                      {gatewayBase}/[kode-opd]/{epForm.slug || 'slug-api'}
                    </p>
                  </div>
                </div>

                {/* 3. Sumber Data: Upload File (CSV/PDF) vs Target URL */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    3. Sumber Data API <span className="text-red-500">*</span>
                  </label>

                  {/* Source Type Selector Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSourceType('file')}
                      className={`flex-1 p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        sourceType === 'file'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File (CSV / PDF / JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceType('url')}
                      className={`flex-1 p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        sourceType === 'url'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Link2 className="w-4 h-4" />
                      <span>URL Link Server External</span>
                    </button>
                  </div>

                  {/* Source Tab Content: FILE UPLOAD */}
                  {sourceType === 'file' ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-blue-500/40 space-y-3 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Upload File Data Instansi (.csv atau .pdf)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Sistem akan otomatis mengubah baris data CSV/PDF Anda menjadi format JSON resmi saat diakses.
                        </p>
                      </div>

                      <input
                        type="file"
                        accept=".csv,.pdf,.json,.txt,.xlsx"
                        onChange={e => setSelectedFile(e.target.files[0] || null)}
                        className="hidden"
                        id="file-upload-input"
                      />
                      <label
                        htmlFor="file-upload-input"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Dari Komputer</span>
                      </label>

                      {selectedFile && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 mt-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>File Terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-2">Alamat server internal atau tautan file dataset resmi yang diproxy oleh Gateway.</p>
                      <div className="relative">
                        <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={epForm.target_url}
                          onChange={e => setEpForm(p => ({ ...p, target_url: e.target.value }))}
                          placeholder="Contoh: https://data.lampungutarakab.go.id/dataset/.../download/data.csv"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Method Permissions Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    4. Method HTTP Yang Diizinkan <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2.5">Pilih jenis operasi data yang diperbolehkan untuk diakses oleh OPD lain:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {HTTP_METHODS.map(m => {
                      const isChecked = epForm.method_permissions.includes(m.name)
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => toggleMethodPermission(m.name)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-300 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${isChecked ? 'bg-blue-600 text-white' : 'border border-slate-400'}`}>
                            {isChecked && '✓'}
                          </div>
                          <div>
                            <span className={`text-xs font-mono font-extrabold px-1.5 py-0.2 rounded border ${methodColor[m.name]}`}>
                              {m.name}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans font-medium">{m.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 5. Status Keaktifan Switch */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Status Keaktifan Service API</span>
                    <p className="text-[11px] text-slate-400">Jika diaktifkan, API akan dapat dilihat dan diajukan di Katalog API Daerah.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEpForm(p => ({ ...p, is_active: !p.is_active }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs cursor-pointer transition-all"
                  >
                    {epForm.is_active ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">AKTIF</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                        <span className="text-slate-400">NON-AKTIF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetEpForm}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEndpoint}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingEndpoint ? 'Simpan Perubahan' : 'Upload & Publisikan API'}</span>
                </button>
              </div>
            </div>
          )}

          {/* LIST OF EXISTING INSTANSI ENDPOINTS */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Daftar API Yang Dipublikasikan ({myEndpoints.length})</span>
              <span className="text-[11px] font-normal text-slate-500">Service data aktif milik instansi Anda</span>
            </h3>

            {myEndpoints.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myEndpoints.map(ep => {
                  const gatewayUrl = `${gatewayBase}/${ep.opd?.code || 'opd'}/${ep.slug}`
                  const isUploadedFile = ep.target_url?.includes('/storage/')

                  return (
                    <div
                      key={ep.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{ep.title}</h4>
                            {ep.is_active ? (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                ● AKTIF
                              </span>
                            ) : (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                                ● NON-AKTIF
                              </span>
                            )}
                            {isUploadedFile && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Upload className="w-2.5 h-2.5" /> File Uploaded
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {(ep.method_permissions || []).map(m => (
                              <span key={m} className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${methodColor[m]}`}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditEndpoint(ep)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700/60"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-500" />
                            <span>Edit API</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEndpoint(ep.id, ep.title)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-red-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      {/* Display Gateway Route Link & Upstream Target */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                        {/* Gateway Public Route Link */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-sans font-bold text-slate-500">
                            <span>GATEWAY ROUTE URL (Output JSON)</span>
                            <button
                              onClick={() => copyText(gatewayUrl, `url-${ep.id}`)}
                              className="text-blue-500 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            >
                              {copiedId === `url-${ep.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === `url-${ep.id}` ? 'Tersalin' : 'Salin URL'}</span>
                            </button>
                          </div>
                          <a
                            href={gatewayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline font-bold text-[11px] break-all flex items-center gap-1 truncate"
                            title="Buka langsung di Chrome"
                          >
                            <span className="truncate">{gatewayUrl}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                          </a>
                        </div>

                        {/* Target Upstream Service / File Link */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-sans font-bold text-slate-500 block">
                            {isUploadedFile ? 'FILE TERUNGGAH (FILE ASLI)' : 'TARGET UPSTREAM SERVICE'}
                          </span>
                          <a
                            href={ep.target_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-700 dark:text-slate-300 hover:text-blue-500 hover:underline font-bold text-[11px] truncate flex items-center gap-1"
                            title={ep.target_url}
                          >
                            <span className="truncate">{ep.target_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <Shield className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-50" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Service API Dipublikasikan</h4>
                  <p className="text-xs text-slate-400 mt-1">Klik tombol <strong>Tambah API Baru</strong> di atas untuk mengunggah file data OPD Anda.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

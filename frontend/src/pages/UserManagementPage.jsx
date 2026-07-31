import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Users, UserPlus, Shield, Building2, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Pencil, Sparkles, KeyRound, Copy } from 'lucide-react'

const DEFAULT_CREDENTIALS = {
  admin: 'AdminPassword2026!',
  bappeda: 'DinasPerencanaan2026!',
  disdukcapil: 'Disdukcapil2026!',
  bkd: 'BkdLampura2026!',
  bpkad: 'BpkadLampura2026!',
}

export default function UserManagementPage() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showModal, setShowModal]   = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [showDefaultPassInModal, setShowDefaultPassInModal] = useState(false)

  // Dynamic Password Memory — Menyimpan password yang diubah/direset oleh admin
  const [customPasswords, setCustomPasswords] = useState(() => {
    try {
      const saved = localStorage.getItem('opd_custom_passwords')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const getAccountPassword = (u) => {
    if (!u) return ''
    if (customPasswords[u.id]) return customPasswords[u.id]
    if (u.username && customPasswords[u.username]) return customPasswords[u.username]
    if (u.username && DEFAULT_CREDENTIALS[u.username]) return DEFAULT_CREDENTIALS[u.username]
    return 'PasswordTelahDiubah'
  }

  const { opds, fetchOpds } = useApiGateway()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'opd',
    opd_id: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'opd',
      opd_id: '',
    })
    setEditingUser(null)
    setShowPassword(false)
    setShowModal(false)
  }

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password: pass }))
    setShowPassword(true)
  }

  const handleOpenCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const handleOpenEditModal = (u) => {
    setEditingUser(u)
    setFormData({
      name: u.name || '',
      username: u.username || '',
      email: u.email || '',
      password: '', // Leave empty unless changing
      role: u.role || 'opd',
      opd_id: u.opd_id ? String(u.opd_id) : '',
    })
    setShowPassword(false)
    setShowDefaultPassInModal(false)
    setShowModal(true)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/users')
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (err) {
      setError('Gagal memuat daftar akun pengguna.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchOpds()
  }, [fetchOpds])

  const handleSaveUser = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = { ...formData }
      if (!payload.opd_id) delete payload.opd_id
      if (editingUser && !payload.password) delete payload.password

      if (editingUser) {
        const res = await api.put(`/api/admin/users/${editingUser.id}`, payload)
        if (res.data.success) {
          // Update dynamic memory
          if (payload.password) {
            const updated = {
              ...customPasswords,
              [editingUser.id]: payload.password,
              [editingUser.username]: payload.password
            }
            setCustomPasswords(updated)
            localStorage.setItem('opd_custom_passwords', JSON.stringify(updated))
          }
          setSuccessMsg(`Akun "${formData.name}" berhasil diperbarui. Password aktif: "${payload.password || getAccountPassword(editingUser)}"`)
          resetForm()
          fetchUsers()
        }
      } else {
        const res = await api.post('/api/admin/users', payload)
        if (res.data.success) {
          const newId = res.data.data?.id
          if (payload.password) {
            const updated = {
              ...customPasswords,
              ...(newId ? { [newId]: payload.password } : {}),
              [payload.username]: payload.password
            }
            setCustomPasswords(updated)
            localStorage.setItem('opd_custom_passwords', JSON.stringify(updated))
          }
          setSuccessMsg(`Akun "${formData.name}" berhasil dibuat dengan password: "${payload.password}"`)
          resetForm()
          fetchUsers()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data akun.')
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Hapus akun "${name}"?`)) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      setSuccessMsg(`Akun ${name} berhasil dihapus.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus akun.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Manajemen Akun Login OPD & Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola kredensial akun pengguna Admin Diskominfo dan Dinas/OPD yang dapat mengakses portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Pengguna & Instansi</th>
                <th className="px-5 py-3.5">Username / Email</th>
                <th className="px-5 py-3.5">Password Kredensial</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">OPD</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {u.opd?.name || 'Tidak terhubung ke OPD'}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-mono text-slate-800 dark:text-slate-200">{u.username || '-'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                  </td>

                  <td className="px-5 py-4">
                    {visiblePasswords[u.id] ? (
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 w-fit">
                        <span>{visiblePasswords[u.id]}</span>
                        <button
                          type="button"
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: null }))}
                          className="text-slate-400 hover:text-slate-200 cursor-pointer ml-1"
                          title="Sembunyikan Password"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const pass = getAccountPassword(u)
                          setVisiblePasswords(prev => ({ ...prev, [u.id]: pass }))
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        title="Klik untuk melihat password kredensial"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lihat Password</span>
                      </button>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {u.role === 'admin' ? 'Super Admin' : 'Akun Dinas OPD'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {u.opd ? (
                      <div>
                        <div className="font-bold">{u.opd.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{u.opd.code}</div>
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-500 italic">—</span>}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all text-xs cursor-pointer"
                        title="Edit Akun"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {editingUser ? <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              {editingUser ? 'Edit Data Akun Login' : 'Buat Akun Login Baru'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Nama Pengguna / Dinas</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Dinas Perencanaan (Bappeda)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="bappeda"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="opd">Dinas / OPD</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email Resmi</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="bappeda@lampungutarakab.go.id"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {editingUser && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      Password Aktif Saat Ini:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDefaultPassInModal(!showDefaultPassInModal)}
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      {showDefaultPassInModal ? 'Sembunyikan' : 'Lihat Plaintext'}
                    </button>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span>{showDefaultPassInModal ? getAccountPassword(editingUser) : '••••••••••••••••'}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">Kredensial Aktif</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold">
                    Password Akun {editingUser && <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Generate Otomatis</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Kosongkan jika tidak diubah...' : 'Masukkan password akun...'}
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {editingUser && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    * Kosongkan jika tidak ingin mengubah password akun ini.
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold">
                    Instansi / OPD Pemilik Akun Ini
                  </label>
                  <a href="/aplikasi" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-0.5">
                    <span>+ Tambah OPD Baru</span>
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">
                  Pilih dinas pemilik akun. Jika dinas belum ada di daftar, daftarkan OPD baru di menu <strong>Aplikasi / OPD Terdaftar</strong>.
                </p>
                <select
                  value={formData.opd_id}
                  onChange={(e) => setFormData({ ...formData, opd_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">-- Tidak Terhubung / Super Admin --</option>
                  {opds.map((opd) => (
                    <option key={opd.id} value={opd.id}>
                      {opd.name} ({opd.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20"
                >
                  {editingUser ? 'Perbarui Akun' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

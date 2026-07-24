import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Users, UserPlus, KeyRound, Shield, Building2, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

export default function UserManagementPage() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showModal, setShowModal]   = useState(false)

  const { applications, fetchApplications } = useApiGateway()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'dinas',
    opd_name: '',
    application_id: '',
  })

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
    fetchApplications()
  }, [fetchApplications])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = { ...formData }
      if (!payload.application_id) delete payload.application_id

      const res = await api.post('/api/admin/users', payload)
      if (res.data.success) {
        setSuccessMsg('Akun pengguna berhasil dibuat.')
        setShowModal(false)
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          role: 'dinas',
          opd_name: '',
          application_id: '',
        })
        fetchUsers()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat akun baru.')
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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Manajemen Akun Login OPD & Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola kredensial akun pengguna Admin Diskominfo dan Dinas/OPD yang dapat mengakses portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Pengguna & Instansi</th>
                <th className="px-5 py-3.5">Username / Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Aplikasi Terkait</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {u.opd_name || 'Dinas / Instansi Daerah'}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-mono text-slate-200">{u.username || '-'}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {u.role === 'admin' ? 'Super Admin' : 'Akun Dinas OPD'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-300 font-medium">
                    {u.application ? u.application.name : <span className="text-slate-500 italic">-</span>}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              Buat Akun Login Baru
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Pengguna / Dinas</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Dinas Perencanaan (Bappeda)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="bappeda"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="dinas">Dinas / OPD</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Resmi</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="bappeda@lampungutarakab.go.id"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Instansi OPD</label>
                <input
                  type="text"
                  value={formData.opd_name}
                  onChange={(e) => setFormData({ ...formData, opd_name: e.target.value })}
                  placeholder="Badan Perencanaan Pembangunan Daerah"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hubungkan ke Aplikasi OPD</label>
                <select
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="">-- Pilih Aplikasi OPD (Opsional) --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.opd})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

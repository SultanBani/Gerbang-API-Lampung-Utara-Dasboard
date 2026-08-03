import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, UserPlus, Shield, Building2, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Pencil, Sparkles, KeyRound, Globe } from 'lucide-react'

const DEFAULT_CREDENTIALS = {
  admin: 'AdminPassword2026!',
  bappeda: 'DinasPerencanaan2026!',
  disdukcapil: 'Disdukcapil2026!',
  bkd: 'BkdLampura2026!',
  bpkad: 'BpkadLampura2026!',
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'opds'

  // Users state
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // OPDs state
  const [opds, setOpds] = useState([])
  const [opdLoading, setOpdLoading] = useState(false)

  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showOpdModal, setShowOpdModal] = useState(false)
  
  const [editingUser, setEditingUser] = useState(null)
  const [editingOpd, setEditingOpd] = useState(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [showDefaultPassInModal, setShowDefaultPassInModal] = useState(false)

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

  // User Form
  const [userForm, setUserForm] = useState({
    name: '', username: '', email: '', password: '', role: 'opd', opd_id: '',
  })

  // OPD Form
  const [opdForm, setOpdForm] = useState({
    name: '', code: '', description: '',
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/users')
      if (res.data.success) setUsers(res.data.data)
    } catch (err) {
      setError('Gagal memuat daftar akun pengguna.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOpds = async () => {
    setOpdLoading(true)
    try {
      const res = await api.get('/api/admin/opds?per_page=100')
      if (res.data.success) setOpds(res.data.data.data) // Pagination payload
    } catch (err) {
      setError('Gagal memuat daftar OPD.')
    } finally {
      setOpdLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchOpds()
  }, [])

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    setUserForm(prev => ({ ...prev, password: pass }))
    setShowPassword(true)
  }

  // === USER HANDLERS ===
  const handleOpenUserModal = (u = null) => {
    setError(null)
    setSuccessMsg(null)
    if (u) {
      setEditingUser(u)
      setUserForm({
        name: u.name || '', username: u.username || '', email: u.email || '',
        password: '', role: u.role || 'opd', opd_id: u.opd_id ? String(u.opd_id) : '',
      })
    } else {
      setEditingUser(null)
      setUserForm({ name: '', username: '', email: '', password: '', role: 'opd', opd_id: '' })
    }
    setShowPassword(false)
    setShowDefaultPassInModal(false)
    setShowUserModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = { ...userForm }
      if (!payload.opd_id) delete payload.opd_id
      if (editingUser && !payload.password) delete payload.password

      if (editingUser) {
        await api.put(`/api/admin/users/${editingUser.id}`, payload)
        if (payload.password) {
          const updated = { ...customPasswords, [editingUser.id]: payload.password, [editingUser.username]: payload.password }
          setCustomPasswords(updated)
          localStorage.setItem('opd_custom_passwords', JSON.stringify(updated))
        }
        setSuccessMsg(`Akun "${userForm.name}" berhasil diperbarui.`)
      } else {
        const res = await api.post('/api/admin/users', payload)
        if (payload.password) {
          const newId = res.data.data?.id
          const updated = { ...customPasswords, ...(newId ? { [newId]: payload.password } : {}), [payload.username]: payload.password }
          setCustomPasswords(updated)
          localStorage.setItem('opd_custom_passwords', JSON.stringify(updated))
        }
        setSuccessMsg(`Akun "${userForm.name}" berhasil dibuat.`)
      }
      setShowUserModal(false)
      fetchUsers()
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

  // === OPD HANDLERS ===
  const handleOpenOpdModal = (o = null) => {
    setError(null)
    setSuccessMsg(null)
    if (o) {
      setEditingOpd(o)
      setOpdForm({ name: o.name || '', code: o.code || '', description: o.description || '' })
    } else {
      setEditingOpd(null)
      setOpdForm({ name: '', code: '', description: '' })
    }
    setShowOpdModal(true)
  }

  const handleSaveOpd = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      if (editingOpd) {
        await api.put(`/api/admin/opds/${editingOpd.id}`, opdForm)
        setSuccessMsg(`OPD "${opdForm.name}" berhasil diperbarui.`)
      } else {
        await api.post('/api/admin/opds', opdForm)
        setSuccessMsg(`OPD "${opdForm.name}" berhasil ditambahkan.`)
      }
      setShowOpdModal(false)
      fetchOpds()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data OPD.')
    }
  }

  const handleDeleteOpd = async (id, name) => {
    if (!window.confirm(`Hapus OPD "${name}" beserta seluruh API miliknya?`)) return
    try {
      await api.delete(`/api/admin/opds/${id}`)
      setSuccessMsg(`OPD ${name} berhasil dihapus.`)
      fetchOpds()
      fetchUsers() // Refresh users as their OPD might have been deleted
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus OPD.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Manajemen Pengguna & Instansi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola instansi (OPD) dan akun pengguna yang dapat mengakses portal.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'users' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Akun Login</div>
        </button>
        <button
          onClick={() => setActiveTab('opds')}
          className={`pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'opds' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Instansi / OPD</div>
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

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenUserModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Tambah Akun Baru
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Pengguna & Instansi</th>
                    <th className="px-5 py-3.5">Username / Email</th>
                    <th className="px-5 py-3.5">Password Kredensial</th>
                    <th className="px-5 py-3.5">Role</th>
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
                            <button onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: null }))} className="text-slate-400 hover:text-slate-200 cursor-pointer ml-1">
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: getAccountPassword(u) }))} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer">
                            <Eye className="w-3.5 h-3.5 text-amber-500" /> Lihat Password
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
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleOpenUserModal(u)} className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all text-xs cursor-pointer"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OPDS */}
      {activeTab === 'opds' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenOpdModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" /> Tambah Instansi (OPD)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opds.map(opd => (
              <div key={opd.id} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{opd.name}</h3>
                    <div className="inline-block bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      {opd.code}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 h-8">
                  {opd.description || 'Tidak ada deskripsi.'}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-lg font-extrabold text-blue-600 dark:text-blue-400">{opd.endpoints_count || 0}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">API Milik</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{opd.users_count || 0}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Akun</span>
                  </div>
                </div>
                
                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button onClick={() => handleOpenOpdModal(opd)} className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                    Edit Instansi
                  </button>
                  <button onClick={() => handleDeleteOpd(opd.id, opd.name)} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg transition-colors cursor-pointer" title="Hapus OPD">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {editingUser ? <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              {editingUser ? 'Edit Data Akun Login' : 'Buat Akun Login Baru'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Nama Pengguna / Dinas</label>
                <input type="text" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Username</label>
                  <input type="text" required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="opd">Dinas / OPD</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email Resmi</label>
                <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
              </div>
              
              {editingUser && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-amber-500" /> Password Aktif Saat Ini:</span>
                    <button type="button" onClick={() => setShowDefaultPassInModal(!showDefaultPassInModal)} className="text-[10px] text-amber-600 font-bold hover:underline cursor-pointer">{showDefaultPassInModal ? 'Sembunyikan' : 'Lihat Plaintext'}</button>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span>{showDefaultPassInModal ? getAccountPassword(editingUser) : '••••••••••••••••'}</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold">Password Akun</label>
                  <button type="button" onClick={handleGeneratePassword} className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"><Sparkles className="w-3 h-3 text-blue-500" /> Generate Otomatis</button>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required={!editingUser} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingUser ? 'Kosongkan jika tidak diubah...' : 'Masukkan password...'} className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs font-semibold" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Instansi / OPD</label>
                <select value={userForm.opd_id} onChange={(e) => setUserForm({ ...userForm, opd_id: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  <option value="">-- Tidak Terhubung / Super Admin --</option>
                  {opds.map((opd) => <option key={opd.id} value={opd.id}>{opd.name} ({opd.code})</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer">{editingUser ? 'Perbarui' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPD MODAL */}
      {showOpdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {editingOpd ? <Pencil className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {editingOpd ? 'Edit Instansi / OPD' : 'Tambah Instansi Baru'}
            </h3>
            <form onSubmit={handleSaveOpd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Nama OPD / Instansi</label>
                <input type="text" required value={opdForm.name} onChange={(e) => setOpdForm({ ...opdForm, name: e.target.value })} placeholder="Contoh: Dinas Kesehatan" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold" />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Kode Unik OPD (Slug)</label>
                <input type="text" required value={opdForm.code} onChange={(e) => setOpdForm({ ...opdForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="contoh: dinkes-lampura" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono" />
                <p className="text-[10px] text-slate-400 mt-1">Hanya huruf kecil, angka, dan strip (-). Digunakan untuk URL API.</p>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Deskripsi / Keterangan</label>
                <textarea rows={3} value={opdForm.description} onChange={(e) => setOpdForm({ ...opdForm, description: e.target.value })} placeholder="Opsional..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowOpdModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl cursor-pointer">{editingOpd ? 'Perbarui' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

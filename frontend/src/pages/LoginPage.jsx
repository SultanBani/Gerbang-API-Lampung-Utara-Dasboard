import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, KeyRound, Building2, UserCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react'

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState('')
  const [password, setPassword]     = useState('')
  const { login, loading, authError, setAuthError } = useAuth()
  const navigate = useNavigate()

  // Preset Kredensial untuk Pengujian & Kemudahan
  const presets = [
    { label: 'Super Admin Diskominfo', user: 'admin', pass: 'AdminPassword2026!', badge: 'Admin', color: 'from-amber-500 to-orange-600' },
    { label: 'Dinas Perencanaan (Bappeda)', user: 'bappeda', pass: 'DinasPerencanaan2026!', badge: 'OPD Dinas', color: 'from-blue-500 to-indigo-600' },
    { label: 'Disdukcapil', user: 'disdukcapil', pass: 'Disdukcapil2026!', badge: 'OPD Dinas', color: 'from-emerald-500 to-teal-600' },
    { label: 'BKD (Kepegawaian)', user: 'bkd', pass: 'BkdLampura2026!', badge: 'OPD Dinas', color: 'from-purple-500 to-violet-600' },
  ]

  const fillPreset = (u, p) => {
    setLoginInput(u)
    setPassword(p)
    if (authError) setAuthError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loginInput || !password) return

    try {
      const loggedUser = await login(loginInput, password)
      if (loggedUser.role === 'admin') {
        navigate('/')
      } else {
        navigate('/portal-dinas')
      }
    } catch (err) {
      // Error handled in AuthContext
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="md:col-span-6 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Sistem Keamanan Terpadu Pemkab Lampung Utara
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              GERBANG API <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                KABUPATEN LAMPUNG UTARA
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform Gateway Interoperabilitas & Manajemen API antar Instansi OPD Pemerintah Kabupaten Lampung Utara.
            </p>
          </div>

          {/* Quick Presets Section */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Pilih Akun Preset untuk Pengujian:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillPreset(p.user, p.pass)}
                  className="flex flex-col text-left p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-slate-200 group-hover:text-blue-300">
                      {p.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded text-white bg-gradient-to-r ${p.color} font-bold`}>
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    User: {p.user}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="md:col-span-6">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Masuk ke Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan kredensial Admin Diskominfo atau Akun Dinas resmi Anda.
              </p>
            </div>

            {authError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username atau Email OPD
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Contoh: bappeda atau admin@lampungutarakab.go.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Akun
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="animate-pulse">Memverifikasi Kredensial...</span>
                ) : (
                  <>
                    <span>Masuk ke System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Pendaftaran akun baru dilakukan oleh **Admin Diskominfo Lampura**. <br />
                Hubungi bidang E-Government jika ada kendala login.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

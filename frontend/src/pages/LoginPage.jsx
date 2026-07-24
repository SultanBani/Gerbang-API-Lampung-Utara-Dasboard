import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, KeyRound, Building2, AlertCircle, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, authError } = useAuth()
  const navigate = useNavigate()

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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans select-none">
      {/* Inline Keyframes Style for Smooth Flowing Gradient & Floating Orbs */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -50px) scale(1.15); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.2); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, 30px) scale(0.9); }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #e0f2fe, #dbeafe, #e0e7ff, #f0f9ff, #bae6fd);
          background-size: 400% 400%;
          animation: gradientFlow 12s ease infinite;
        }
        .orb-1 { animation: floatOrb1 10s ease-in-out infinite; }
        .orb-2 { animation: floatOrb2 14s ease-in-out infinite; }
        .orb-3 { animation: floatOrb3 12s ease-in-out infinite; }
      `}</style>

      {/* Main Animated Flowing Gradient Canvas */}
      <div className="absolute inset-0 animated-gradient-bg pointer-events-none" />

      {/* Animated Floating Glowing Light Orbs */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none orb-1" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl pointer-events-none orb-2" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none orb-3" />

      {/* Decorative Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md z-10 my-auto">

        {/* Main Clean Card Container */}
        <div className="bg-white/90 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.18)] space-y-7 relative">

          {/* Top Header & Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex relative group mx-auto mb-1">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-md opacity-35 group-hover:opacity-65 transition duration-300"></div>
              <img
                src="/logo.png"
                alt="Gerbang API Logo"
                className="relative w-20 h-20 rounded-2xl object-cover shadow-xl border-2 border-white bg-white p-1"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/90 text-blue-700 text-[11px] font-extrabold tracking-wide mb-2 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />

              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                GERBANG API
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                Lampung Utara
              </p>
            </div>
          </div>

          {/* Alert Message */}
          {authError && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="font-semibold leading-relaxed">{authError}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Username / Email OPD
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all font-semibold shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Password Akun
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-10 py-3 bg-white/80 border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all font-semibold shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Masuk ke System Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistem Aktif & Terlindungi</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hak Cipta © 2026 <strong>Diskominfo Lampung Utara</strong>.<br />
              Pengelolaan & Akses Gateway Terintegrasi.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

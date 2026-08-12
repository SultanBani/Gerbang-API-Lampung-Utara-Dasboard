import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, Menu, X, Sun, Moon } from 'lucide-react'
import api from '../services/api'

/* ── Topic card icons (inline SVG — matching screenshot exactly) ── */
function IconKependudukan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}
function IconKesehatan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconPendidikan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <path d="M12 3L2 9l10 6 10-6-10-6z" /><path d="M2 9v6" /><path d="M6 11v5c0 2 2.5 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}
function IconPekerjaanUmum() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-5h4v5" />
    </svg>
  )
}
function IconPertanian() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <path d="M12 2C8 2 5 5.5 5 9c0 4 3 7 7 10 4-3 7-6 7-10 0-3.5-3-7-7-7z" /><path d="M12 2v19" />
    </svg>
  )
}
function IconKeuangan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  )
}

/* ── Stats icons ── */
function IconNetwork() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7 mx-auto transition-transform duration-500 group-hover:rotate-12">
      <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
      <path d="M12 7v4M10 13l-3 4M14 13l3 4" />
    </svg>
  )
}
function IconDataset() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7 mx-auto transition-transform duration-500 group-hover:scale-110">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

const topics = [
  { Icon: IconKependudukan, label: 'Kependudukan & Capil' },
  { Icon: IconKesehatan, label: 'Kesehatan & RSUD' },
  { Icon: IconPendidikan, label: 'Pendidikan & Kebudayaan' },
  { Icon: IconPekerjaanUmum, label: 'Pekerjaan Umum & Tata Ruang' },
  { Icon: IconPertanian, label: 'Pertanian & Perikanan' },
  { Icon: IconKeuangan, label: 'Keuangan & Aset Daerah (BPKAD)' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Reveal States for stats scrolling
  const [statsVisible1, setStatsVisible1] = useState(false)
  const [statsVisible2, setStatsVisible2] = useState(false)

  const [dbStats, setDbStats] = useState({ opds: '45+', endpoints: '1.500+' })

  // Typewriter effect states
  const [welcomeText, setWelcomeText] = useState('')
  const words = ['APIGATE Lampung Utara']
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  const loginDest = '/login'
  const loginLabel = 'Login'

  useEffect(() => {
    const currentWord = words[wordIndex]
    if (charIndex >= currentWord.length) {
      return
    }

    const timer = setTimeout(() => {
      setWelcomeText(currentWord.substring(0, charIndex + 1))
      setCharIndex(prev => prev + 1)
    }, 120)

    return () => clearTimeout(timer)
  }, [charIndex, wordIndex])

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await api.get('/api/public/stats')
        if (response.data?.success) {
          setDbStats({
            opds: response.data.total_opds + '+',
            endpoints: response.data.total_endpoints + '+'
          })
        }
      } catch (err) {
        console.error('Failed to fetch public stats:', err)
      }
    }
    fetchPublicStats()
  }, [])

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']")
    if (link) {
      link.setAttribute('href', '/favicon_apigate.png')
    }
    return () => {
      const link = document.querySelector("link[rel~='icon']")
      if (link) {
        link.setAttribute('href', '/logo.png')
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Setup intersection observers for stats card scroll reveal
  useEffect(() => {
    const observer1 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsVisible1(true)
      }
    }, { threshold: 0.15 })

    const observer2 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsVisible2(true)
      }
    }, { threshold: 0.15 })

    const target1 = document.getElementById('stat-card-1')
    const target2 = document.getElementById('stat-card-2')

    if (target1) observer1.observe(target1)
    if (target2) observer2.observe(target2)

    return () => {
      observer1.disconnect()
      observer2.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500"
      style={{ fontFamily: "'Segoe UI', 'Inter', sans-serif" }}>

      {/* Stunning CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulseCenter {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(37, 99, 235, 0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(37, 99, 235, 0.7)); }
        }
        @keyframes dataFlow {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes nodeGather {
          0% { transform: scale(0.9) translate(var(--x-start, 0), var(--y-start, 0)); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(0.3) translate(0, 0); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animated-hero-container {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        .hover-card-effect {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-card-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
        }
        .dark .hover-card-effect:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #1e3a8a }
        }
        .dark .animate-pulse-caret {
          border-right: 3px solid #60a5fa;
        }
        @media (prefers-color-scheme: dark) {
          .dark .animate-pulse-caret {
            animation: blink-caret-dark 0.75s step-end infinite;
          }
        }
        @keyframes blink-caret-dark {
          from, to { border-color: transparent }
          50% { border-color: #60a5fa }
        }
        .center-hub {
          animation: pulseCenter 3s ease-in-out infinite;
          transform-origin: center;
        }
        .data-line {
          stroke-dasharray: 6 4;
          animation: dataFlow 2s linear infinite;
        }
        .gathering-particle {
          animation: nodeGather 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          transform-origin: center;
        }
        .shimmer-bg {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}} />

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down ${scrolled ? 'backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-transparent' : 'border-b border-slate-100/50 dark:border-slate-800/40 bg-white/60 dark:bg-transparent'}`} style={{ background: isDark ? 'linear-gradient(to right, #1e293b, #0f172a)' : '' }}>
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo — matching sidebar style */}
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/favicon_apigate.png" alt="APIGATE Icon" className="w-9 h-9 object-contain" />
            <div className="w-px h-7 bg-slate-300 dark:bg-white/30 shrink-0"></div>
            <div className="leading-none">
              <span className="text-[15px] font-black tracking-tight leading-none text-slate-900 dark:text-white">APIG<span className="text-amber-500 dark:text-amber-400">A</span>TE</span>
              <div className="mt-0.5"><span className="text-[7px] font-extrabold text-blue-600 dark:text-slate-400 tracking-[0.15em] uppercase">Lampung Utara</span></div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold">
            <a href="#beranda" className="text-blue-700 dark:text-white border-b-2 border-blue-700 dark:border-white pb-0.5 transition-all">Beranda</a>
            <button onClick={() => navigate('/panduan')} className="text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold text-xs sm:text-sm">Panduan</button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-600/80 text-slate-700 dark:text-white p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={() => navigate(loginDest)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95 border-none"
            >
              {loginLabel} <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-blue-100 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-3 shadow-lg text-sm font-semibold">
            <a href="#beranda" onClick={() => setMenuOpen(false)} className="block text-blue-700 dark:text-white py-1">Beranda</a>
            <button onClick={() => { navigate('/panduan'); setMenuOpen(false); }} className="block text-left w-full text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white py-1 bg-transparent border-none font-semibold">Panduan</button>
          </div>
        )}
      </nav>

      {/* ══════════════════ HERO SECTION WRAPPER ══════════════════ */}
      <div className="w-full relative border-b border-slate-100/80 dark:border-slate-800/60 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
        {/* Premium Decorative Gradient Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-[130px] pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute top-[300px] left-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-400/8 blur-[120px] pointer-events-none -ml-40"></div>

        {/* Offset */}
        <div className="h-16"></div>

        {/* ══════════════════ HERO ══════════════════ */}
        <section id="beranda" className="py-16 sm:py-20 px-6 max-w-5xl mx-auto animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Left Text Column */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm animate-pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="3" className="w-3.5 h-3.5 shrink-0 dark:stroke-emerald-400">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-[10px] font-bold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase">Sistem Aktif & Terlindungi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white leading-tight min-h-[90px] sm:min-h-[120px]">
              Selamat Datang di <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                {welcomeText}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto md:mx-0">
              Pintu Gerbang Layanan & Data Terintegrasi Kabupaten Lampung Utara. Membangun ekosistem pemerintahan digital yang aman, efisien, dan transparan untuk seluruh Organisasi Perangkat Daerah (OPD).
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-400 dark:hover:to-indigo-400 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 cursor-pointer active:scale-95"
              >
                Mulai Sekarang
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/panduan')}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Right Column: Live Data Gathering Animation */}
          <div className="flex-1 flex justify-center w-full max-w-sm md:max-w-none">
            <div className="relative group p-2 w-full max-w-[340px]">
              {/* Outer decorative glow */}
              <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/20 rounded-3xl blur-xl group-hover:bg-blue-600/15 dark:group-hover:bg-blue-500/30 transition-all duration-500"></div>

              {/* Animated Gathering Container Box */}
              <div className="animated-hero-container relative w-full bg-slate-900 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 rounded-3xl p-5 shadow-2xl overflow-hidden flex flex-col justify-center items-center" style={{ minHeight: '260px' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e3a8a,transparent_75%)] opacity-40"></div>
                <div className="shimmer-bg absolute inset-0 pointer-events-none opacity-30"></div>

                {/* SVG Live Data Gathering Node Map */}
                <svg viewBox="0 0 300 240" className="w-full h-auto relative z-10">
                  {/* Connecting Lines */}
                  <path d="M 40 45 Q 150 75 150 120" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.35" className="data-line" />
                  <path d="M 260 45 Q 150 75 150 120" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.35" className="data-line" />
                  <path d="M 40 195 Q 150 165 150 120" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.35" className="data-line" />
                  <path d="M 260 195 Q 150 165 150 120" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.35" className="data-line" />
                  <path d="M 150 25 L 150 120" stroke="#8b5cf6" strokeWidth="1.5" fill="none" opacity="0.35" className="data-line" />

                  {/* Flowing Converging Particles */}
                  <circle cx="150" cy="120" r="7" fill="#3b82f6" className="gathering-particle" style={{ "--x-start": "-110px", "--y-start": "-75px", "animationDelay": "0s" }} />
                  <circle cx="150" cy="120" r="7" fill="#ef4444" className="gathering-particle" style={{ "--x-start": "110px", "--y-start": "-75px", "animationDelay": "0.6s" }} />
                  <circle cx="150" cy="120" r="7" fill="#10b981" className="gathering-particle" style={{ "--x-start": "-110px", "--y-start": "75px", "animationDelay": "1.2s" }} />
                  <circle cx="150" cy="120" r="7" fill="#f59e0b" className="gathering-particle" style={{ "--x-start": "110px", "--y-start": "75px", "animationDelay": "1.8s" }} />
                  <circle cx="150" cy="120" r="7" fill="#8b5cf6" className="gathering-particle" style={{ "--x-start": "0px", "--y-start": "-95px", "animationDelay": "2.4s" }} />

                  {/* Outer Node 1: Disdukcapil */}
                  <circle cx="40" cy="45" r="13" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="40" y="49" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">🪪</text>
                  <text x="40" y="24" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Capil</text>

                  {/* Outer Node 2: Kesehatan */}
                  <circle cx="260" cy="45" r="13" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="260" y="49" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">🏥</text>
                  <text x="260" y="24" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Kes</text>

                  {/* Outer Node 3: Keuangan */}
                  <circle cx="40" cy="195" r="13" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="40" y="199" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">💰</text>
                  <text x="40" y="217" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">BPKAD</text>

                  {/* Outer Node 4: Pertanian */}
                  <circle cx="260" cy="195" r="13" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="260" y="199" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">🐟</text>
                  <text x="260" y="217" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Tani</text>

                  {/* Outer Node 5: Pendidikan */}
                  <circle cx="150" cy="25" r="13" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1.5" />
                  <text x="150" y="29" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">🎓</text>

                  {/* Central Gateway Core (Gathers Everything) */}
                  <circle cx="150" cy="120" r="22" fill="#0f172a" stroke="#2563eb" strokeWidth="3" className="center-hub" />
                  <path d="M144 116 h12 v10 a4 4 0 0 1-4 4 h-4 a4 4 0 0 1-4-4 z M147 112 h6 v4 h-6 z" fill="#3b82f6" />
                  <circle cx="150" cy="122" r="3" fill="#fff" />
                </svg>

                {/* Subtext on bottom of hub */}
                <span className="text-[10px] text-blue-400 font-bold tracking-widest mt-2 uppercase select-none">APIGATE Hub</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* ══════════════════ STATS — 2 CARDS (Scroll Reveal Stagger) ══════════════════ */}
      <section className="py-8 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1: OPD Terintegrasi */}
          <div
            id="stat-card-1"
            className={`group bg-white dark:bg-slate-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm hover-card-effect cursor-pointer transition-all duration-1000 transform ${statsVisible1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
              }`}
          >
            <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400">
              <IconNetwork />
            </div>
            <div className="text-3xl font-black text-blue-950 dark:text-blue-300 mb-1">{dbStats.opds}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">OPD Terintegrasi</div>
          </div>

          {/* Card 2: Dataset Sektoral */}
          <div
            id="stat-card-2"
            className={`group bg-white dark:bg-slate-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm hover-card-effect cursor-pointer transition-all duration-1000 transform ${statsVisible2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
              }`}
          >
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400">
              <IconDataset />
            </div>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mb-1">{dbStats.endpoints}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">Dataset Sektoral</div>
          </div>
        </div>
      </section>

      {/* ══════════════════ TOPIK DATA ══════════════════ */}
      <section id="panduan" className="py-12 px-6 max-w-5xl mx-auto animate-fade-in-up delay-200">
        <div>
          {/* Section header */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" className="w-5 h-5 dark:stroke-blue-400">
                <circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
                <path d="M7 5h10M7 19h10M5 7v10M19 7v10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">Topik Layanan Data</h2>
            </div>
          </div>

          {/* Topic grid (Responsive: 1 col on mobile, 2 on tablet, 3 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map(({ Icon, label }, i) => (
              <button
                key={i}
                onClick={() => navigate(loginDest)}
                className="group bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 cursor-pointer text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-300 shadow-sm hover-card-effect"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Icon />
                </div>
                <span className="leading-snug transition-colors duration-200">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ MUTED FOOTER ══════════════════ */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-colors duration-500">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Column 1 - APIGATE Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon_apigate.png" alt="APIGATE Icon" className="w-9 h-9 object-contain" />
              <div className="leading-none">
                <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100">APIG<span className="text-amber-500">A</span>TE</span>
                <div className="mt-0.5"><span className="text-[7px] font-extrabold text-blue-700 dark:text-blue-400 tracking-[0.15em] uppercase">Lampung Utara</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Portal Data Resmi Pemerintah Kabupaten Lampung Utara. Menyediakan akses terbuka ke data pemerintahan untuk mendorong transparansi dan inovasi publik.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">© 2026 Dinas Komunikasi dan Informatika Kabupaten Lampung Utara. All Rights Reserved.</p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Tautan Penting</div>
            <ul className="space-y-2.5 text-xs">
              {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Keamanan Informasi', 'Peta Situs'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors decoration-transparent">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact details */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Kontak Kami</div>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 dark:text-slate-500">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>Jl. Jend. Sudirman No.1, Kotabumi</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <span>info@lampungutarakab.go.id</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z" />
                </svg>
                <span>(0724) 123456</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Diskominfo Logo */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Dikelola Oleh</div>
            <div className="flex items-center">
              <img src="/logo_diskominfo.png" alt="Diskominfo Lampung Utara" className="h-14 w-auto object-contain shrink-0" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

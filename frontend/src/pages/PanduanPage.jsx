import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, ArrowLeft, KeyRound, Database, Code2, Send, ShieldCheck, HelpCircle, Sun, Moon, Menu, X } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />,
    title: 'Daftar Akun',
    desc: 'Hubungi admin untuk mendaftarkan akun OPD Anda.',
  },
  {
    number: '02',
    icon: <KeyRound size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />,
    title: 'Login Portal',
    desc: 'Masuk menggunakan kredensial OPD yang diberikan.',
  },
  {
    number: '03',
    icon: <Database size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />,
    title: 'Pilih Dataset',
    desc: 'Cari data sektoral yang dibutuhkan di Katalog API.',
  },
  {
    number: '04',
    icon: <Send size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />,
    title: 'Minta Akses',
    desc: 'Ajukan permohonan akses ke OPD pemilik data.',
  },
  {
    number: '05',
    icon: <Code2 size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />,
    title: 'Salin Kode',
    desc: 'Terapkan kodingan integrasi siap pakai di sistem Anda.',
  },
]

const faqs = [
  {
    q: 'Apa itu API Key?',
    a: 'Kunci unik autentikasi yang didapatkan setelah permohonan hak akses disetujui, dikirim via header X-API-KEY.',
  },
  {
    q: 'Bagaimana cara mengirim API Key saat memanggil API?',
    a: 'Sertakan di header HTTP request dengan nama "X-API-KEY". Contoh: X-API-KEY: [api_key_anda].',
  },
  {
    q: 'Format apa yang dikembalikan oleh APIGATE?',
    a: 'Setiap respons dari server dikembalikan dalam format standard JSON.',
  },
  {
    q: 'Apa yang harus dilakukan jika mendapat error 401 Unauthorized?',
    a: 'Pastikan header X-API-KEY Anda valid, aktif, dan sudah disetujui oleh OPD pemilik data.',
  },
]

export default function PanduanPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [revealSection, setRevealSection] = useState(false)
  const [faqVisible, setFaqVisible] = useState(false)
  const [activeFaqIndex, setActiveFaqIndex] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealSection(true)
      }
    }, { threshold: 0.1 })
    const target = document.getElementById('steps-section')
    if (target) observer.observe(target)

    const faqObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setFaqVisible(true)
      }
    }, { threshold: 0.1 })
    const faqSection = document.getElementById('faq-section')
    if (faqSection) faqObserver.observe(faqSection)

    return () => {
      observer.disconnect()
      faqObserver.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500"
      style={{ fontFamily: "'Segoe UI', 'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(30, 58, 138, 0.08);
        }
        .dark .hover-lift:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .stagger-step {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stagger-step.reveal {
          opacity: 1;
          transform: translateY(0);
        }
      `}} />

      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
      <div className="absolute top-[400px] left-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-400/8 blur-[100px] pointer-events-none -ml-40"></div>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down ${scrolled ? 'backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-transparent' : 'border-b border-slate-100/50 dark:border-slate-800/40 bg-white/60 dark:bg-transparent'}`} style={{ background: isDark ? 'linear-gradient(to right, #1e293b, #0f172a)' : '' }}>
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2 hover:opacity-85 transition-opacity border-none text-left bg-transparent">
            <img src="/favicon_apigate.png" alt="APIGATE Icon" className="w-9 h-9 object-contain" />
            <div className="w-px h-7 bg-slate-300 dark:bg-white/30 shrink-0"></div>
            <div className="leading-none">
              <span className="text-[15px] font-black tracking-tight leading-none text-slate-900 dark:text-white">APIG<span className="text-amber-500 dark:text-amber-400">A</span>TE</span>
              <div className="mt-0.5"><span className="text-[7px] font-extrabold text-blue-600 dark:text-slate-400 tracking-[0.15em] uppercase">Lampung Utara</span></div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold">
            <button onClick={() => navigate('/')} className="text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold text-xs sm:text-sm">Beranda</button>
            <button onClick={() => navigate('/panduan')} className="text-blue-700 dark:text-white border-b-2 border-blue-700 dark:border-white pb-0.5 transition-all bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer font-semibold text-xs sm:text-sm">Panduan</button>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-600/80 text-slate-700 dark:text-white p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            <button onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95 border-none">
              Login <ArrowRight size={14} />
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
            <button onClick={() => { navigate('/'); setMenuOpen(false); }} className="block text-left w-full text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white py-1 bg-transparent border-none font-semibold">Beranda</button>
            <button onClick={() => { navigate('/panduan'); setMenuOpen(false); }} className="block text-left w-full text-blue-700 dark:text-white py-1 bg-transparent border-none font-semibold">Panduan</button>
          </div>
        )}
      </nav>

      {/* Navbar offset */}
      <div className="h-16"></div>

      {/* ── Page Header (Gradient & Less Plain) ── */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800 overflow-hidden animate-fade-in-up py-12 sm:py-16 px-6 bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_50%)]"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-200 hover:text-blue-800 dark:hover:text-white bg-transparent border-none cursor-pointer mb-4 font-bold transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">Panduan Penggunaan</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Langkah cepat mengintegrasikan data sektoral antar OPD Kabupaten Lampung Utara menggunakan APIGATE.
          </p>
        </div>
      </div>

      {/* ── Steps Section (Horizontal Side-by-Side Grid) ── */}
      <section id="steps-section" className="py-12 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-blue-500/10 dark:bg-blue-500/15 rounded-lg border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center">
            <Database size={16} className="text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none m-0">Alur Integrasi Cepat</h2>
        </div>

        {/* Horizontal Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`stagger-step group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover-lift cursor-default shadow-sm text-center flex flex-col items-center justify-between ${
                revealSection ? 'reveal' : ''
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Step indicator circle */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:border-blue-600 dark:group-hover:bg-blue-600 dark:group-hover:border-blue-600 flex items-center justify-center mb-3.5 transition-all duration-300">
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors">{step.number}</span>
              </div>

              {/* Title & Short Desc */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight m-0">{step.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed m-0">{step.desc}</p>
              </div>

              {/* Icon marker at bottom */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center text-blue-600 dark:text-blue-400">
                {step.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Example Section ── */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 hover-lift shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white leading-none m-0">Contoh Kode Integrasi (Laravel)</h2>
          </div>
          <pre className="bg-slate-900 dark:bg-slate-950 text-sky-300 rounded-xl p-4 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800 dark:border-slate-700 shadow-inner max-h-[180px]">{`<?php
use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
    'X-API-KEY' => 'API_KEY_ANDA',
    'Accept'    => 'application/json',
])->get('http://localhost:8000/APIGATELU/kode-opd/nama-endpoint');

if ($response->successful()) {
    $data = $response->json();
    return response()->json($data);
}`}</pre>
        </div>
      </section>

      {/* ── FAQ Section (Collapsible Accordion) ── */}
      <section id="faq-section" className={`px-6 pb-16 max-w-5xl mx-auto transition-all duration-1000 transform ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-lg border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center">
            <HelpCircle size={16} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none m-0">Pertanyaan Umum</h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = activeFaqIndex === i
            return (
              <div
                key={i}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover-lift"
                onClick={() => setActiveFaqIndex(isOpen ? null : i)}
              >
                {/* Header (Question + Toggle button) */}
                <div className="w-full px-5 py-4 flex items-center justify-between text-left select-none">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                    <span className="text-emerald-500 dark:text-emerald-400 shrink-0">❓</span>
                    <span>{faq.q}</span>
                  </p>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-350 shrink-0 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Collapsible Answer container */}
                <div
                  className="transition-all duration-350 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '120px' : '0',
                    borderTop: isOpen ? '1px solid' : '0px solid transparent',
                    borderTopColor: isOpen ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent'
                  }}
                >
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed p-5 m-0 bg-slate-50/50 dark:bg-slate-800/50">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
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

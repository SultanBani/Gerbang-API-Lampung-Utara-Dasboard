import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, KeyRound, Database, Code2, Send, ShieldCheck, HelpCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <ShieldCheck size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />,
    title: 'Daftar Akun',
    desc: 'Hubungi admin untuk mendaftarkan akun OPD Anda.',
  },
  {
    number: '02',
    icon: <KeyRound size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />,
    title: 'Login Portal',
    desc: 'Masuk menggunakan kredensial OPD yang diberikan.',
  },
  {
    number: '03',
    icon: <Database size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />,
    title: 'Pilih Dataset',
    desc: 'Cari data sektoral yang dibutuhkan di Katalog API.',
  },
  {
    number: '04',
    icon: <Send size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />,
    title: 'Minta Akses',
    desc: 'Ajukan permohonan akses ke OPD pemilik data.',
  },
  {
    number: '05',
    icon: <Code2 size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />,
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
  const [scrolled, setScrolled] = useState(false)
  const [revealSection, setRevealSection] = useState(false)
  const [faqVisible, setFaqVisible] = useState(false)
  const [activeFaqIndex, setActiveFaqIndex] = useState(null)

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
    <div className="min-h-screen text-slate-800 relative overflow-hidden"
      style={{ background: '#f5f7fa', fontFamily: "'Segoe UI', 'Inter', sans-serif" }}>

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
          border-color: #3b82f6 !important;
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
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
      <div className="absolute top-[400px] left-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -ml-40"></div>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down ${scrolled ? 'backdrop-blur-md shadow-lg border-b border-indigo-500/20' : 'border-b border-indigo-500/10'}`} style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', transition: 'all 0.3s' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center hover:opacity-85 transition-opacity bg-white rounded-lg px-2.5 py-1 shadow-sm border-none text-left">
            <img src="/logo_apiget.png" alt="APIGATE Logo" className="h-8 w-auto object-contain" />
          </button>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 600 }}>
            <button onClick={() => navigate('/')} className="text-blue-100 hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold text-xs sm:text-sm">Beranda</button>
            <button onClick={() => navigate('/panduan')} className="text-white border-b-2 border-white pb-0.5 transition-all bg-transparent border-none cursor-pointer font-semibold text-xs sm:text-sm">Panduan</button>
          </div>
          <button onClick={() => navigate('/login')}
            style={{ background: '#fff', color: '#2563eb', fontWeight: 800, fontSize: 13, padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Login <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Navbar offset */}
      <div className="h-16"></div>

      {/* ── Page Header (Gradient & Less Plain) ── */}
      <div className="relative border-b border-slate-200/80 overflow-hidden animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '48px 24px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_50%)]"></div>
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-blue-200 hover:text-white bg-transparent border-none cursor-pointer mb-4 font-bold transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </button>
          <h1 className="text-2xl font-black text-white leading-tight mb-2">Panduan Penggunaan</h1>
          <p className="text-xs text-blue-100/90 leading-relaxed max-w-xl">
            Langkah cepat mengintegrasikan data sektoral antar OPD Kabupaten Lampung Utara menggunakan APIGATE.
          </p>
        </div>
      </div>

      {/* ── Steps Section (Horizontal Side-by-Side Grid) ── */}
      <section id="steps-section" style={{ padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-center justify-center">
            <Database size={16} className="text-blue-700" />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none m-0">Alur Integrasi Cepat</h2>
        </div>

        {/* Horizontal Step Cards (flex-col on mobile, flex-row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`stagger-step group bg-white border border-slate-200/80 rounded-2xl p-5 hover-lift cursor-default shadow-sm text-center flex flex-col items-center justify-between ${
                revealSection ? 'reveal' : ''
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Step indicator circle */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center mb-3.5 transition-all duration-300">
                <span className="text-xs font-black text-blue-700 group-hover:text-white transition-colors">{step.number}</span>
              </div>

              {/* Title & Short Desc */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-xs font-extrabold text-slate-900 leading-tight m-0">{step.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed m-0">{step.desc}</p>
              </div>

              {/* Icon marker at bottom */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 w-full flex justify-center text-blue-600">
                {step.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Example Section (Fade-in on scroll) ── */}
      <section style={{ padding: '0 24px 48px', maxWidth: 900, margin: '0 auto' }}>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover-lift shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <h2 className="text-xs font-extrabold text-slate-900 leading-none m-0">Contoh Kode Integrasi (Laravel)</h2>
          </div>
          <pre className="bg-slate-900 text-sky-300 rounded-xl p-4 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800 shadow-inner max-h-[180px]">{`<?php
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
      <section id="faq-section" style={{ padding: '0 24px 64px', maxWidth: 900, margin: '0 auto' }}
        className={`transition-all duration-1000 transform ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center justify-center">
            <HelpCircle size={16} className="text-emerald-700" />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none m-0">Pertanyaan Umum</h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = activeFaqIndex === i
            return (
              <div
                key={i}
                className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover-lift"
                onClick={() => setActiveFaqIndex(isOpen ? null : i)}
              >
                {/* Header (Question + Toggle button) */}
                <div className="w-full px-5 py-4 flex items-center justify-between text-left select-none">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    <span className="text-emerald-500 shrink-0">❓</span>
                    <span>{faq.q}</span>
                  </p>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`w-4 h-4 text-slate-400 transition-transform duration-350 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Collapsible Answer container */}
                <div
                  className="transition-all duration-350 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '120px' : '0',
                    borderTop: isOpen ? '1px solid #f1f5f9' : '0px solid transparent'
                  }}
                >
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed p-5 m-0 bg-slate-50/50">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA Footer (Government Blue Background) ── */}
      <section style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="border-t border-indigo-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_60%)]"></div>
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-white leading-tight">Siap Memulai Integrasi?</h2>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Masuk menggunakan akun OPD Anda untuk membuka Katalog Layanan dan mulai mengajukan perizinan akses.
          </p>
          <button onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-extrabold px-6 py-3.5 rounded-xl text-xs hover:bg-slate-50 transition-all shadow-lg shadow-blue-950/20 active:scale-95 cursor-pointer">
            Masuk ke APIGATE <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, HelpCircle } from 'lucide-react'

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten Integrasi Gerbang API Lampung Utara. Ada yang bisa saya bantu terkait integrasi API, pemecahan masalah HTTP error, atau perizinan OPD?',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = () => {
    const q = inputQuery.trim()
    if (!q) return

    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    setMessages(prev => [...prev, { sender: 'user', text: q, time: currentTime }])
    setInputQuery('')
    setIsTyping(true)

    setTimeout(() => {
      let reply = ''
      const lower = q.toLowerCase()

      if (lower.includes('403') || lower.includes('forbidden') || lower.includes('izin') || lower.includes('akses')) {
        reply = `🔒 Solusi Error 403 Forbidden (Hak Akses API):\n\n• Penyebab: Aplikasi OPD Anda belum diberikan izin untuk mengakses endpoint tersebut.\n• Tindakan Admin: Buka menu "Hak Akses API", cari nama Aplikasi Anda, lalu centang izin pada endpoint tujuan.\n• Tindakan OPD: Hubungi Super Admin Diskominfo untuk mengaktifkan akses di Matrix Hak Akses.`
      } else if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('key') || lower.includes('token') || lower.includes('secret')) {
        reply = `🔑 Autentikasi & Format API Key (Error 401):\n\n• Header Wajib:\n  X-Client-ID: [ID_APLIKASI]\n  X-Secret-Key: [API_KEY_RESMI]\n• Lokasi Key: Pengguna OPD dapat melihat API Key aktif pada Portal Instansi OPD.\n• Rotasi Key: Admin dapat menekan "Generate Key Baru" pada menu Token / API Key jika terjadi indikasi kebocoran.`
      } else if (lower.includes('404') || lower.includes('not found') || lower.includes('endpoint')) {
        reply = `📍 Panduan Endpoint Gateway (Error 404):\n\n• Penyebab 404: Route endpoint belum terdaftar di Gateway atau penulisan URL tidak sesuai.\n• Daftar Endpoint Utama:\n  - GET /gateway/dukcapil/penduduk (Validasi NIK)\n  - GET /gateway/kepegawaian/v1/data (Data Pegawai BKD)\n  - GET /gateway/perencanaan/program (RKPD Bappeda)\n  - GET /gateway/keuangan/apbd (Realisasi APBD BPKAD)\n• Solusi: Pendaftaran endpoint baru dilakukan di menu "Manajemen Endpoint API".`
      } else if (lower.includes('502') || lower.includes('bad gateway') || lower.includes('down') || lower.includes('mati')) {
        reply = `⚠️ Diagnostik 502 Bad Gateway:\n\n• Penyebab: Upstream server asal milik OPD tidak merespons request Gateway (Timeout / Offline).\n• Solusi: Periksa server internal asal OPD untuk memastikan service backend dalam keadaan aktif.`
      } else if (lower.includes('login') || lower.includes('akun') || lower.includes('opd') || lower.includes('dinas') || lower.includes('pass')) {
        reply = `👥 Hak Akses Akun Login:\n\n• Super Admin Diskominfo: Akses penuh pengelolaan aplikasi, endpoint, matrix perizinan, dan akun instansi.\n• Akun Instansi OPD: Khusus login per dinas (Bappeda, Dukcapil, BKD, dll.) untuk memantau token dan statistik izin dinasnya.\n• Pembuatan Akun: Dikelola oleh Admin di menu "Manajemen Akun OPD".`
      } else if (lower.includes('cara') || lower.includes('integrasi') || lower.includes('panggil') || lower.includes('code') || lower.includes('curl')) {
        reply = `💻 Contoh Panggilan API Integrasi (cURL):\n\ncurl -X GET "http://localhost:8000/gateway/dukcapil/penduduk" \\\n  -H "X-Client-ID: 1" \\\n  -H "X-Secret-Key: gkp_bappeda_key_2026_x89a" \\\n  -H "Accept: application/json"\n\nPengujian langsung dapat dilakukan pada menu API Tester.`
      } else {
        reply = `Asisten Integrasi Gerbang API\n\nSilakan pilih topik bantuan berikut:\n• 🔑 API Key & Autentikasi (Error 401)\n• 🔒 Matrix Hak Akses (Error 403)\n• 📍 Daftar Endpoint Gateway (Error 404)\n• 👥 Informasi Akun Login Admin & OPD\n• 💻 Contoh Kode Integrasi cURL`
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }])
      setIsTyping(false)
    }, 600)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Pop-up Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] mb-4 animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-100">Asisten Integrasi Gateway</h3>
                <span className="text-[10px] text-slate-400 font-medium block">Pusat Bantuan API Developer</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-slate-950" ref={chatContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="font-extrabold text-[10px] text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>Asisten Gateway</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-none p-3 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Memproses tanggapan...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {[
              'Error 403 Forbidden',
              'Header API Key',
              'Contoh Code cURL',
              'Daftar Endpoint',
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputQuery(chip)
                  setTimeout(() => {
                    const btn = document.getElementById('ai-send-btn')
                    if (btn) btn.click()
                  }, 50)
                }}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <input
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyUp={e => e.key === 'Enter' && handleSendMessage()}
              type="text"
              placeholder="Tanyakan seputar API Gateway..."
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              id="ai-send-btn"
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl shadow-blue-600/30 border border-slate-700/40 flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative"
        title="Buka Asisten Integrasi API"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-blue-400 dark:text-white" />
          <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full absolute -top-1 -right-1"></span>
        </div>
        <span className="text-xs font-extrabold pr-1 hidden sm:inline tracking-tight">Asisten Gateway</span>
      </button>
    </div>
  )
}

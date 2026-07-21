import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Halo! Saya AI Assistant Gerbang API Lampung Utara. Ada yang bisa saya bantu terkait integrasi API, analisis error log, atau saran keamanan?',
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
        reply = `🔒 Solusi Error 403 Forbidden / Hak Akses API:\n\n- Penyebab: Aplikasi OPD Anda belum memiliki izin untuk mengakses endpoint tersebut.\n- Solusi untuk Admin: Buka menu "Hak Akses API", cari nama Aplikasi Anda, lalu centang IZINKAN pada endpoint tujuan.\n- Solusi untuk OPD: Hubungi Admin Diskominfo untuk mengaktifkan izin di Matrix Hak Akses.`
      } else if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('key') || lower.includes('token') || lower.includes('secret')) {
        reply = `🔑 Panduan API Key & Autentikasi 401:\n\n- Header Wajib:\n  X-Client-ID: [ID_APLIKASI_ANDA]\n  X-Secret-Key: [API_KEY_OPD_ANDA]\n- Lokasi API Key: OPD dapat melihat API Key resmi pada Portal Instansi OPD.\n- Jika terjadi kebocoran key, Admin Diskominfo dapat mengklik "Generate Key Baru" di menu Token / API Key.`
      } else if (lower.includes('404') || lower.includes('not found') || lower.includes('endpoint')) {
        reply = `📍 Panduan Endpoint & Error 404:\n\n- Penyebab 404: Endpoint belum didaftarkan di sistem Gateway atau URL salah.\n- Daftar Endpoint Bawaan:\n  • GET /gateway/dukcapil/penduduk (Validasi NIK Dukcapil)\n  • GET /gateway/kepegawaian/v1/data (Data Pegawai BKD)\n  • GET /gateway/perencanaan/program (RKPD Bappeda)\n  • GET /gateway/keuangan/apbd (Data APBD BPKAD)\n- Solusi: Admin dapat menambah endpoint baru di menu "Endpoint API".`
      } else if (lower.includes('502') || lower.includes('bad gateway') || lower.includes('down') || lower.includes('mati')) {
        reply = `⚠️ Analisis 502 Bad Gateway:\n\n- Penyebab: Server internal OPD (Upstream) tidak dapat dijangkau oleh Gateway (Timeout / Offline).\n- Solusi: Pastikan server asal milik OPD tempat API di-hosting dalam kondisi aktif.`
      } else if (lower.includes('login') || lower.includes('akun') || lower.includes('opd') || lower.includes('dinas') || lower.includes('pass')) {
        reply = `👥 Manajemen Akun Login Admin & OPD:\n\n- Super Admin Diskominfo: Mengelola penuh aplikasi, endpoint, matrix perizinan, dan akun OPD.\n- Akun Instansi OPD: Khusus login per dinas (seperti Bappeda, Dukcapil, BKD) untuk melihat API Key & Endpoint izin dinasnya.\n- Pendaftaran: Akun baru dibuat oleh Admin di menu "Akun Login OPD" agar terhindar dari penyalahgunaan.`
      } else if (lower.includes('cara') || lower.includes('integrasi') || lower.includes('panggil') || lower.includes('code') || lower.includes('curl')) {
        reply = `💻 Contoh Panggilan API Integrasi (cURL):\n\ncurl -X GET "http://localhost:8000/gateway/dukcapil/penduduk" \\\n  -H "X-Client-ID: 1" \\\n  -H "X-Secret-Key: gkp_bappeda_key_2026_x89a" \\\n  -H "Accept: application/json"\n\nAnda juga dapat mencoba interaktif melalui menu API Tester!`
      } else {
        reply = `🤖 Asisten AI Gerbang API Lampung Utara\n\nSaya siap membantu Anda! Silakan tanyakan hal berikut:\n- 🔑 API Key & Autentikasi (Error 401)\n- 🔒 Izin Akses & Matrix Permission (Error 403)\n- 📍 Daftar Endpoint API (Error 404)\n- 👥 Informasi Akun Login Admin & OPD\n- 💻 Contoh Kode Integrasi Data`
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }])
      setIsTyping(false)
    }, 800)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pop-up Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] mb-4 animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-sm shadow">
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">AI Assistant Gerbang API</h3>
                <span className="text-[10px] text-blue-100 font-semibold">Integrasi AI Modul Developer</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 text-sm font-bold cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-slate-950" ref={chatContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="font-extrabold text-[10px] text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                      <span>🤖 AI Assistant</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span className="text-[9px] opacity-60 block text-right mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-none p-3 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>AI sedang berpikir...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-1.5 bg-slate-100/60 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {[
              'Error 403 Forbidden',
              'Format Header API Key',
              'Contoh Code cURL',
              'Daftar Endpoint API',
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
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex gap-2">
            <input
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyUp={e => e.key === 'Enter' && handleSendMessage()}
              type="text"
              placeholder="Tanyakan endpoint, error, atau keamanan..."
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              id="ai-send-btn"
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-200 relative cursor-pointer"
      >
        <span>🤖</span>
        <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full absolute top-0 right-0"></span>
      </button>
    </div>
  )
}

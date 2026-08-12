import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, X, Send, Sparkles, HelpCircle } from 'lucide-react'

const DRAG_THRESHOLD = 5 // pixels — less than this is a click, more is a drag
const BUTTON_SIZE = 52 // approximate button size for boundary calc
const STORAGE_KEY = 'ai-widget-position'

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef(null)

  // Drag state
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate bounds
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed
        }
      }
    } catch (e) {}
    // Default: bottom-right
    return { x: window.innerWidth - 72, y: window.innerHeight - 72 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({
    startX: 0, startY: 0,
    startPosX: 0, startPosY: 0,
    hasMoved: false
  })
  const buttonRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten Integrasi APIGATE Kabupaten Lampung Utara. Ada yang bisa saya bantu terkait permohonan hak akses API, pengambilan data (GET), atau penginputan data (POST)?',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Constrain position to viewport
  const clampPosition = useCallback((x, y) => {
    const maxX = window.innerWidth - BUTTON_SIZE
    const maxY = window.innerHeight - BUTTON_SIZE
    return {
      x: Math.max(8, Math.min(x, maxX)),
      y: Math.max(8, Math.min(y, maxY))
    }
  }, [])

  // Persist position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
  }, [position])

  // Fix position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => clampPosition(prev.x, prev.y))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [clampPosition])

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false
    }
    setIsDragging(true)
  }, [position])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragRef.current.hasMoved = true
    }
    
    const newPos = clampPosition(
      dragRef.current.startPosX + dx,
      dragRef.current.startPosY + dy
    )
    setPosition(newPos)
  }, [isDragging, clampPosition])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (!dragRef.current.hasMoved) {
      setIsOpen(prev => !prev)
    }
  }, [isDragging])

  // Touch drag handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false
    }
    setIsDragging(true)
  }, [position])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const dx = touch.clientX - dragRef.current.startX
    const dy = touch.clientY - dragRef.current.startY
    
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragRef.current.hasMoved = true
    }
    
    const newPos = clampPosition(
      dragRef.current.startPosX + dx,
      dragRef.current.startPosY + dy
    )
    setPosition(newPos)
  }, [isDragging, clampPosition])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (!dragRef.current.hasMoved) {
      setIsOpen(prev => !prev)
    }
  }, [isDragging])

  // Attach global listeners during drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Calculate popup position based on button location
  const getPopupStyle = () => {
    const popupWidth = 384
    const popupHeight = 480
    const margin = 12

    let left = position.x
    let top = position.y - popupHeight - margin

    // If not enough space above, show below
    if (top < 8) {
      top = position.y + BUTTON_SIZE + margin
    }

    // If not enough space on right, shift left
    if (left + popupWidth > window.innerWidth - 8) {
      left = window.innerWidth - popupWidth - 8
    }

    // If not enough space on left
    if (left < 8) {
      left = 8
    }

    // If not enough space below either, overlay center
    if (top + popupHeight > window.innerHeight - 8) {
      top = Math.max(8, (window.innerHeight - popupHeight) / 2)
    }

    return { left: `${left}px`, top: `${top}px` }
  }

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
    <>
      {/* Pop-up Window — positioned dynamically based on button location */}
      {isOpen && (
        <div
          className="fixed z-50 font-sans"
          style={getPopupStyle()}
        >
          <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in zoom-in duration-200">
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
        </div>
      )}

      {/* Floating Draggable Toggle Button */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`fixed z-50 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl shadow-blue-600/30 border border-slate-700/40 flex items-center gap-2.5 transition-shadow duration-300 hover:shadow-blue-600/50 active:scale-95 select-none ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'box-shadow 0.3s, transform 0.15s'
        }}
        title="Buka Asisten Integrasi API — Seret untuk pindahkan"
      >
        <div className="relative pointer-events-none">
          <Bot className="w-5 h-5 text-blue-400 dark:text-white" />
          <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full absolute -top-1 -right-1"></span>
        </div>
        <span className="text-xs font-extrabold pr-1 hidden sm:inline tracking-tight pointer-events-none">Asisten Gateway</span>
      </button>
    </>
  )
}

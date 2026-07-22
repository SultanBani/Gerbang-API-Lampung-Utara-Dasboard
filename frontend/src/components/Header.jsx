import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Bell, ShieldAlert, KeyRound, ServerOff, Menu, X } from 'lucide-react'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/aplikasi': 'Aplikasi Terdaftar',
  '/endpoints': 'Manajemen Endpoint API',
  '/hak-akses': 'Hak Akses API Matrix',
  '/api-keys': 'Token / API Key',
  '/logs': 'Log Request',
  '/tester': 'API Tester',
  '/dokumentasi': 'Dokumentasi API',
  '/users': 'Manajemen Akun OPD',
  '/portal-dinas': 'Portal Instansi OPD'
}

export default function Header({ onToggleSidebar }) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)

  const currentTitle = routeTitles[location.pathname] || 'Dashboard'

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Contoh Notifikasi Real-time Gateway
  const notifications = [
    {
      id: 1,
      title: 'Peringatan Keamanan API Key',
      desc: 'API Key SIMPEG BKD mendekati masa rotasi tahunan.',
      time: '10 menit lalu',
      type: 'warning',
      icon: KeyRound,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 2,
      title: 'Deteksi High Request Traffic',
      desc: 'SIAK Dukcapil mencatat 1.200 request/jam pada endpoint /penduduk.',
      time: '1 jam lalu',
      type: 'info',
      icon: ShieldAlert,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 3,
      title: 'Upstream Server Offline',
      desc: 'Server SIPKD BPKAD sempat mengalami kendala koneksi (Status 502).',
      time: '3 jam lalu',
      type: 'error',
      icon: ServerOff,
      color: 'text-red-500 bg-red-500/10'
    }
  ]

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 md:px-8 flex-shrink-0 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            {currentTitle}
          </h2>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block truncate max-w-[200px] sm:max-w-none">
            Portal Integrasi Data Pemkab Lampung Utara
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Status Gateway Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>Gateway Active</span>
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="hidden md:inline">{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>
        </button>

        {/* Quick Action Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifikasi</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">3</span>
          </button>

          {/* Popover Dropdown Notifikasi */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Notifikasi System Gateway</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => {
                  const IconComp = item.icon
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Tandai Semua Sudah Dibaca ✓
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="hidden lg:block text-right border-l border-slate-200 dark:border-slate-800 pl-4 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200">{currentDate}</div>
          <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">Lampung Utara GMT+7</div>
        </div>
      </div>
    </header>
  )
}

import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Bell } from 'lucide-react'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/aplikasi': 'Aplikasi Terdaftar',
  '/endpoints': 'Manajemen Endpoint API',
  '/hak-akses': 'Hak Akses API Matrix',
  '/api-keys': 'Token / API Key',
  '/logs': 'Log Request',
  '/tester': 'API Tester',
  '/dokumentasi': 'Dokumentasi API'
}

export default function Header() {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  const currentTitle = routeTitles[location.pathname] || 'Dashboard'

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-30 transition-colors duration-300">
      <div>
        <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none">
          {currentTitle}
        </h2>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
          Portal Integrasi Data Pemerintah Kabupaten Lampung Utara
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Gateway Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>Gateway Active</span>
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="hidden md:inline">{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>
        </button>

        {/* Quick Action Notifications */}
        <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Notifikasi</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">3</span>
        </button>

        {/* Date Display */}
        <div className="hidden lg:block text-right border-l border-slate-200 dark:border-slate-800 pl-4 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200">{currentDate}</div>
          <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">Lampung Utara GMT+7</div>
        </div>
      </div>
    </header>
  )
}

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApiGateway } from '../context/ApiGatewayContext'
import { useAuth } from '../context/AuthContext'
import {
  BarChart3,
  Sliders,
  ClipboardList,
  TestTube,
  BookOpen,
  LogOut,
  Users,
  Building2,
  Globe,
  Shield,
  X
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { endpoints } = useApiGateway()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  // ── Navigation Items ──────────────────────────────────────────────

  // Admin Monitoring — hanya muncul untuk role admin
  const navItemsMonitoringAdmin = isAdmin ? [
    { to: '/dashboard', label: 'Dashboard Monitoring', icon: BarChart3 },
    { to: '/users', label: 'Manajemen Pengguna & Instansi', icon: Users },
    { to: '/endpoints', label: 'Endpoint API', icon: Sliders, badge: endpoints.length, badgeStyle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20' },
    { to: '/logs', label: 'Log Request', icon: ClipboardList, badge: 'Live', badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' }
  ] : []

  // Portal Layanan OPD — hanya muncul untuk role OPD (bukan admin)
  const navItemsLayananOpd = !isAdmin ? [
    { to: '/portal-opd', label: 'Dashboard OPD', icon: Building2 },
    { to: '/portal-opd/catalog', label: 'Katalog API', icon: Globe },
    { to: '/portal-opd/manage', label: 'Kelola API Saya', icon: Shield },
  ] : []

  // Developer Tools — muncul untuk semua user
  const navItemsDeveloper = [
    { to: '/tester', label: 'API Tester', icon: TestTube },
    { to: '/dokumentasi', label: 'Dokumentasi API', icon: BookOpen }
  ]

  const getInitials = (name) => {
    if (!name) return 'OP'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const renderNavLinks = (items) => (
    items.map(item => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={handleNavClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 mb-1 relative ${isActive
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
          }`
        }
      >
        <item.icon className="w-4 h-4 text-center shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeStyle || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            {item.badge}
          </span>
        )}
      </NavLink>
    ))
  )

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Gerbang API Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5"
            />
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-none">Gerbang API</h1>
              <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 tracking-widest uppercase block mt-1">Lampung Utara</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu Groups */}
        <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Admin Monitoring */}
          {isAdmin && (
            <div>
              <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">
                Monitoring & Kelola
              </span>
              {renderNavLinks(navItemsMonitoringAdmin)}
            </div>
          )}

          {/* Portal Layanan OPD — hanya untuk role OPD */}
          {!isAdmin && navItemsLayananOpd.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">
                Portal Layanan OPD
              </span>
              {renderNavLinks(navItemsLayananOpd)}
            </div>
          )}

          {/* Developer Tools */}
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">
              Alat Integrasi & Pengujian
            </span>
            {renderNavLinks(navItemsDeveloper)}
          </div>
        </nav>
      </div>

      {/* User Profile Footer & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="truncate">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Pengguna'}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isAdmin ? 'Super Admin' : (user?.opd?.name || 'Dinas OPD')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 shrink-0 z-40 transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

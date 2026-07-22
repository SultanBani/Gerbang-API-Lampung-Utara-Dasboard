import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApiGateway } from '../context/ApiGatewayContext'
import { useAuth } from '../context/AuthContext'
import { 
  BarChart3, 
  FolderKanban, 
  Sliders, 
  Lock, 
  Key, 
  ClipboardList, 
  TestTube, 
  BookOpen, 
  LogOut,
  Users,
  Building2
} from 'lucide-react'

export default function Sidebar() {
  const { applications, endpoints } = useApiGateway()
  const { user, logout, isAdmin, isDinas } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItemsUtama = isAdmin
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { to: '/aplikasi', label: 'Aplikasi Terdaftar', icon: FolderKanban, badge: applications.length },
        { to: '/users', label: 'Akun Login OPD', icon: Users }
      ]
    : [
        { to: '/portal-dinas', label: 'Portal Instansi OPD', icon: Building2 }
      ]

  const navItemsManajemen = isAdmin
    ? [
        { to: '/endpoints', label: 'Endpoint API', icon: Sliders, badge: endpoints.length, badgeStyle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20' },
        { to: '/hak-akses', label: 'Hak Akses API', icon: Lock },
        { to: '/api-keys', label: 'Token / API Key', icon: Key }
      ]
    : []

  const navItemsMonitoring = isAdmin
    ? [
        { to: '/logs', label: 'Log Request', icon: ClipboardList, badge: 'Live', badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' }
      ]
    : []

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

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 transition-colors duration-300 shadow-sm z-40">
      <div>
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/25">
            🔗
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-none">Gerbang API</h1>
            <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 tracking-widest uppercase block mt-1">Diskominfo Lampung Utara</span>
          </div>
        </div>

        {/* Navigation Menu Groups */}
        <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">
              {isAdmin ? 'Utama' : 'Menu Instansi'}
            </span>
            {navItemsUtama.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 mb-1 relative ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4 text-center" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeStyle || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <>
              <div>
                <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Manajemen API</span>
                {navItemsManajemen.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 mb-1 relative ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 text-center" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeStyle || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>

              <div>
                <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Monitoring</span>
                {navItemsMonitoring.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 mb-1 relative ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 text-center" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeStyle || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </>
          )}

          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Developer</span>
            {navItemsDeveloper.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 mb-1 relative ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4 text-center" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Admin / Dinas Profile Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 backdrop-blur flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-xs text-white shadow">
              {getInitials(user?.name)}
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
          </div>
          <div className="leading-tight truncate">
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-200 truncate">{user?.name || 'Pengguna'}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize block truncate">
              {user?.role === 'admin' ? 'Super Administrator' : user?.opd_name || 'Instansi OPD'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Keluar"
          className="text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}

import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AiChatWidget from './components/AiChatWidget'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import PanduanPage from './pages/PanduanPage'
import DashboardPage from './pages/DashboardPage'
import EndpointPage from './pages/EndpointPage'
import LogRequestPage from './pages/LogRequestPage'
import ApiTesterPage from './pages/ApiTesterPage'
import DokumentasiPage from './pages/DokumentasiPage'
import OpdDashboardPage from './pages/OpdDashboardPage'
import OpdCatalogPage from './pages/OpdCatalogPage'
import OpdManageApiPage from './pages/OpdManageApiPage'
import UserManagementPage from './pages/UserManagementPage'

export default function App() {
  const { user, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Routes>
      {/* ── Landing Page — selalu tampil ── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Panduan Page — publik ── */}
      <Route path="/panduan" element={<PanduanPage />} />

      {/* ── Route Login Publik — selalu tampil ── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Protected Main App Layout ── */}
      <Route
        path="/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex transition-colors duration-300 relative overflow-hidden">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                  <Routes>
                    <Route path="/" element={<Navigate to={isAdmin ? '/dashboard' : '/portal-opd'} replace />} />

                    {/* Admin Only */}
                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/users" element={<UserManagementPage />} />
                      <Route path="/endpoints" element={<EndpointPage />} />
                      <Route path="/logs" element={<LogRequestPage />} />
                    </Route>

                    {/* OPD Routes */}
                    <Route element={<ProtectedRoute requireAdmin={false} />}>
                      <Route path="/portal-opd" element={<OpdDashboardPage />} />
                      <Route path="/portal-opd/catalog" element={<OpdCatalogPage />} />
                      <Route path="/portal-opd/manage" element={<OpdManageApiPage />} />
                    </Route>

                    {/* Shared */}
                    <Route path="/tester" element={<ApiTesterPage />} />
                    <Route path="/dokumentasi" element={<DokumentasiPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={isAdmin ? '/dashboard' : '/portal-opd'} replace />} />
                  </Routes>
                </main>
              </div>

              <AiChatWidget />
            </div>
          )
        }
      />
    </Routes>
  )
}

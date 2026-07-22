import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AplikasiPage from './pages/AplikasiPage'
import EndpointPage from './pages/EndpointPage'
import HakAksesPage from './pages/HakAksesPage'
import ApiKeyPage from './pages/ApiKeyPage'
import LogRequestPage from './pages/LogRequestPage'
import ApiTesterPage from './pages/ApiTesterPage'
import DokumentasiPage from './pages/DokumentasiPage'
import DinasDashboardPage from './pages/DinasDashboardPage'
import UserManagementPage from './pages/UserManagementPage'

export default function App() {
  const { user, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Routes>
      {/* Route Login Publik */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Layout Protected Routes */}
      <Route
        path="/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex transition-colors duration-300 relative overflow-hidden">
              {/* Sidebar Component with Mobile Drawer */}
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              {/* Main Content Layout */}
              <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {/* Main Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                  <Routes>
                    {/* Default Home Redirect */}
                    <Route
                      path="/"
                      element={
                        isAdmin ? (
                          <Navigate to="/dashboard" replace />
                        ) : (
                          <Navigate to="/portal-dinas" replace />
                        )
                      }
                    />

                    {/* Admin Only Routes */}
                    {isAdmin && (
                      <>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/aplikasi" element={<AplikasiPage />} />
                        <Route path="/users" element={<UserManagementPage />} />
                        <Route path="/endpoints" element={<EndpointPage />} />
                        <Route path="/hak-akses" element={<HakAksesPage />} />
                        <Route path="/api-keys" element={<ApiKeyPage />} />
                        <Route path="/logs" element={<LogRequestPage />} />
                      </>
                    )}

                    {/* Dinas OPD Only Routes */}
                    {!isAdmin && (
                      <Route path="/portal-dinas" element={<DinasDashboardPage />} />
                    )}

                    {/* Shared Routes */}
                    <Route path="/tester" element={<ApiTesterPage />} />
                    <Route path="/dokumentasi" element={<DokumentasiPage />} />

                    {/* Fallback Catch-all Route */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={isAdmin ? "/dashboard" : "/portal-dinas"}
                          replace
                        />
                      }
                    />
                  </Routes>
                </main>
              </div>
            </div>
          )
        }
      />
    </Routes>
  )
}

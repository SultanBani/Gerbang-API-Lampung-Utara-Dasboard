import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AiChatWidget from './components/AiChatWidget'

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
  const { user, isAdmin, isDinas } = useAuth()

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex transition-colors duration-300">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content Layout */}
              <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <Header />

                {/* Main Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
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
                        <Route path="/endpoints" element={<EndpointPage />} />
                        <Route path="/hak-akses" element={<HakAksesPage />} />
                        <Route path="/api-keys" element={<ApiKeyPage />} />
                        <Route path="/logs" element={<LogRequestPage />} />
                        <Route path="/users" element={<UserManagementPage />} />
                      </>
                    )}

                    {/* Dinas Portal Route */}
                    <Route path="/portal-dinas" element={<DinasDashboardPage />} />

                    {/* Common Routes */}
                    <Route path="/tester" element={<ApiTesterPage />} />
                    <Route path="/dokumentasi" element={<DokumentasiPage />} />

                    {/* Fallback Catch-all Route */}
                    <Route
                      path="*"
                      element={
                        isAdmin ? (
                          <Navigate to="/dashboard" replace />
                        ) : (
                          <Navigate to="/portal-dinas" replace />
                        )
                      }
                    />
                  </Routes>
                </main>
              </div>

              {/* AI Chatbot Widget */}
              <AiChatWidget />
            </div>
          )
        }
      />
    </Routes>
  )
}

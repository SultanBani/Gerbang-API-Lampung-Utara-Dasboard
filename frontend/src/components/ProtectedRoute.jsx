import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, isAdmin } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    // Jika butuh admin tapi user bukan admin, lempar ke dashboard OPD
    return <Navigate to="/portal-opd" replace />
  }

  if (!requireAdmin && isAdmin) {
    // Jika route khusus OPD tapi user adalah admin, lempar ke dashboard Admin
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

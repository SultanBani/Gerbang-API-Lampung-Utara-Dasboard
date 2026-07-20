import React, { createContext, useContext, useState } from 'react'

const ApiGatewayContext = createContext()

const initialApplications = [
  { id: 1, name: 'SIMPEG', fullName: 'Sistem Informasi Kepegawaian', opd: 'BKPSDM', pic: 'Budi Santoso', phone: '0812-3456-7890', description: 'Data kepegawaian ASN Kabupaten Lampung Utara', status: 'active', createdAt: '2025-01-01' },
  { id: 2, name: 'SIAK', fullName: 'Sistem Informasi Administrasi Kependudukan', opd: 'Disdukcapil', pic: 'Siti Rahma', phone: '0813-9876-5432', description: 'Integrasi data kependudukan dan NIK warga', status: 'active', createdAt: '2025-01-15' },
  { id: 3, name: 'E-Office', fullName: 'Manajemen Surat & Dokumen Digital', opd: 'Diskominfo', pic: 'Ahmad Fadli', phone: '0852-1122-3344', description: 'Sistem persuratan dan disposisi elektronik OPD', status: 'active', createdAt: '2025-01-20' },
  { id: 4, name: 'SIPD', fullName: 'Sistem Informasi Pemerintahan Daerah', opd: 'BPKAD', pic: 'Rina Dewi', phone: '0821-4455-6677', description: 'Perencanaan dan keuangan daerah', status: 'active', createdAt: '2025-02-01' },
  { id: 5, name: 'Absensi', fullName: 'Sistem Absensi ASN Online', opd: 'BKPSDM', pic: 'Dewi Lestari', phone: '0857-7788-9900', description: 'Pencatatan kehadiran pegawai harian', status: 'active', createdAt: '2025-02-10' },
  { id: 6, name: 'PPDB', fullName: 'Penerimaan Peserta Didik Baru', opd: 'Dinas Pendidikan', pic: 'Hendra W.', phone: '0819-3344-5566', description: 'Pendaftaran sekolah tingkat SD & SMP', status: 'inactive', createdAt: '2025-03-01' },
  { id: 7, name: 'Website OPD', fullName: 'Portal Resmi Website OPD', opd: 'Diskominfo', pic: 'Fajar Putra', phone: '0812-6677-8899', description: 'Portal informasi publik OPD', status: 'active', createdAt: '2025-03-15' },
  { id: 8, name: 'E-Kinerja', fullName: 'Manajemen Kinerja ASN', opd: 'BKPSDM', pic: 'Yuli Andini', phone: '0823-1122-4455', description: 'Penilaian SKP dan capaian kinerja pegawai', status: 'active', createdAt: '2025-04-01' }
]

const initialEndpoints = [
  { id: 1, method: 'GET', url: '/api/pegawai', description: 'Ambil daftar seluruh data pegawai ASN', tag: 'Pegawai', isAuthRequired: true, rateLimit: 100 },
  { id: 2, method: 'GET', url: '/api/pegawai/{id}', description: 'Ambil detail data pegawai berdasarkan ID/NIP', tag: 'Pegawai', isAuthRequired: true, rateLimit: 100 },
  { id: 3, method: 'POST', url: '/api/pegawai', description: 'Tambah data pegawai baru ke SIMPEG', tag: 'Pegawai', isAuthRequired: true, rateLimit: 20 },
  { id: 4, method: 'PUT', url: '/api/pegawai/{id}', description: 'Update data profil kepegawaian', tag: 'Pegawai', isAuthRequired: true, rateLimit: 20 },
  { id: 5, method: 'DELETE', url: '/api/pegawai/{id}', description: 'Hapus/nonaktifkan status kepegawaian', tag: 'Pegawai', isAuthRequired: true, rateLimit: 5 },
  { id: 6, method: 'GET', url: '/api/opd', description: 'Daftar seluruh Organisasi Perangkat Daerah', tag: 'OPD', isAuthRequired: true, rateLimit: 200 },
  { id: 7, method: 'POST', url: '/api/auth/login', description: 'Login dan generate API Bearer Token', tag: 'Auth', isAuthRequired: false, rateLimit: 10 },
  { id: 8, method: 'POST', url: '/api/auth/logout', description: 'Logout dan invalidate session token', tag: 'Auth', isAuthRequired: true, rateLimit: 10 },
  { id: 9, method: 'GET', url: '/api/penduduk', description: 'Integrasi data kependudukan SIAK', tag: 'Penduduk', isAuthRequired: true, rateLimit: 50 }
]

const initialApiKeys = [
  { id: 1, appId: 1, appName: 'SIMPEG', opd: 'BKPSDM', key: '3f8c9e2a1b4d7e8f9a0b1c2d3e4f5a6b', status: 'active', expiresAt: '2026-12-31', lastUsedAt: '2026-07-20 15:10:02' },
  { id: 2, appId: 2, appName: 'SIAK', opd: 'Disdukcapil', key: 'a7d2f19b3c5e8f0a1b2c3d4e5f6a7b8c', status: 'active', expiresAt: '2026-10-15', lastUsedAt: '2026-07-20 14:55:12' },
  { id: 3, appId: 3, appName: 'E-Office', opd: 'Diskominfo', key: 'b9e3c2d4f6a8b0c1d2e3f4a5b6c7d8e9', status: 'active', expiresAt: '2026-11-30', lastUsedAt: '2026-07-20 15:12:44' },
  { id: 4, appId: 4, appName: 'SIPD', opd: 'BPKAD', key: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', status: 'active', expiresAt: '2026-09-01', lastUsedAt: '2026-07-20 13:40:10' },
  { id: 5, appId: 5, appName: 'Absensi', opd: 'BKPSDM', key: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', status: 'active', expiresAt: '2027-01-15', lastUsedAt: '2026-07-20 15:08:22' },
  { id: 6, appId: 6, appName: 'PPDB', opd: 'Dinas Pendidikan', key: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', status: 'expired', expiresAt: '2026-06-30', lastUsedAt: '2026-06-28 09:12:00' },
  { id: 7, appId: 7, appName: 'Website OPD', opd: 'Diskominfo', key: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9', status: 'active', expiresAt: '2026-12-01', lastUsedAt: '2026-07-20 12:00:15' },
  { id: 8, appId: 8, appName: 'E-Kinerja', opd: 'BKPSDM', key: 'g5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', status: 'active', expiresAt: '2026-12-15', lastUsedAt: '2026-07-20 14:20:00' }
]

const initialAccessControls = {
  '1_1': true, '1_2': true, '1_3': true, '1_4': true, '1_5': true, '1_6': true, '1_7': true,
  '2_1': true, '2_6': true, '2_7': true, '2_9': true,
  '3_1': true, '3_2': true, '3_6': true, '3_7': true, '3_8': true,
  '4_1': true, '4_6': true, '4_7': true,
  '5_1': true, '5_7': true, '5_5': false,
  '6_7': true,
  '7_6': true,
  '8_1': true, '8_2': true, '8_6': true
}

const initialRequestLogs = [
  { id: 1, timestamp: '2026-07-20 15:12:44', appName: 'E-Office', method: 'GET', url: '/api/pegawai', statusCode: 200, responseTimeMs: 87, ipAddress: '172.16.0.12', aiAnalysis: null },
  { id: 2, timestamp: '2026-07-20 15:10:02', appName: 'SIMPEG', method: 'GET', url: '/api/pegawai/102', statusCode: 200, responseTimeMs: 102, ipAddress: '172.16.0.10', aiAnalysis: null },
  { id: 3, timestamp: '2026-07-20 15:08:22', appName: 'Absensi', method: 'DELETE', url: '/api/pegawai/5', statusCode: 403, responseTimeMs: 45, ipAddress: '172.16.0.18', aiAnalysis: 'Kemungkinan Penyebab: Aplikasi Absensi tidak memiliki hak akses untuk endpoint DELETE /api/pegawai.\n\nSolusi: Buka menu Hak Akses API dan aktifkan toggle izin untuk aplikasi Absensi pada endpoint ini.' },
  { id: 4, timestamp: '2026-07-20 14:55:12', appName: 'SIAK', method: 'GET', url: '/api/penduduk', statusCode: 200, responseTimeMs: 198, ipAddress: '172.16.0.25', aiAnalysis: null },
  { id: 5, timestamp: '2026-07-20 14:30:15', appName: 'PPDB', method: 'GET', url: '/api/siswa', statusCode: 401, responseTimeMs: 31, ipAddress: '172.16.0.20', aiAnalysis: 'Kemungkinan Penyebab: Token API Key aplikasi PPDB telah kadaluwarsa (Expired: 2026-06-30).\n\nSolusi: Buka menu Token / API Key, lalu klik tombol "Generate Baru" untuk memperbarui API Key PPDB.' },
  { id: 6, timestamp: '2026-07-20 14:20:00', appName: 'E-Kinerja', method: 'POST', url: '/api/kinerja', statusCode: 500, responseTimeMs: 2103, ipAddress: '172.16.0.22', aiAnalysis: 'Kemungkinan Penyebab: Database target timeout atau tabel tb_kinerja mengalami locking pada server internal.\n\nSolusi: Periksa performa server database BKPSDM dan pastikan koneksi database di .env valid.' },
  { id: 7, timestamp: '2026-07-20 13:40:10', appName: 'SIPD', method: 'POST', url: '/api/auth/login', statusCode: 200, responseTimeMs: 210, ipAddress: '172.16.0.15', aiAnalysis: null },
  { id: 8, timestamp: '2026-07-20 12:00:15', appName: 'Website OPD', method: 'GET', url: '/api/opd', statusCode: 200, responseTimeMs: 55, ipAddress: '172.16.0.30', aiAnalysis: null }
]

export function ApiGatewayProvider({ children }) {
  const [applications, setApplications] = useState(initialApplications)
  const [endpoints, setEndpoints] = useState(initialEndpoints)
  const [apiKeys, setApiKeys] = useState(initialApiKeys)
  const [accessControls, setAccessControls] = useState(initialAccessControls)
  const [requestLogs, setRequestLogs] = useState(initialRequestLogs)

  const addApplication = (app) => {
    const newId = applications.length ? Math.max(...applications.map(a => a.id)) + 1 : 1
    const newApp = {
      id: newId,
      name: app.name,
      fullName: app.fullName || app.name,
      opd: app.opd,
      pic: app.pic,
      phone: app.phone || '-',
      description: app.description || '',
      status: app.status || 'active',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setApplications(prev => [newApp, ...prev])

    const randomKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setApiKeys(prev => [
      {
        id: prev.length + 1,
        appId: newId,
        appName: newApp.name,
        opd: newApp.opd,
        key: randomKey,
        status: 'active',
        expiresAt: '2026-12-31',
        lastUsedAt: '-'
      },
      ...prev
    ])
  }

  const deleteApplication = (id) => {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const addEndpoint = (ep) => {
    const newId = endpoints.length ? Math.max(...endpoints.map(e => e.id)) + 1 : 1
    const newEp = {
      id: newId,
      method: ep.method.toUpperCase(),
      url: ep.url.startsWith('/') ? ep.url : '/' + ep.url,
      description: ep.description || '',
      tag: ep.tag || 'Umum',
      isAuthRequired: ep.isAuthRequired ?? true,
      rateLimit: Number(ep.rateLimit) || 60
    }
    setEndpoints(prev => [...prev, newEp])
  }

  const deleteEndpoint = (id) => {
    setEndpoints(prev => prev.filter(e => e.id !== id))
  }

  const toggleAccess = (appId, endpointId) => {
    const key = `${appId}_${endpointId}`
    setAccessControls(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const generateNewKey = (appId) => {
    const randomKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setApiKeys(prev => prev.map(k => k.appId === appId ? { ...k, key: randomKey, status: 'active' } : k))
  }

  const revokeKey = (appId) => {
    setApiKeys(prev => prev.map(k => k.appId === appId ? { ...k, status: 'revoked' } : k))
  }

  const addRequestLog = (log) => {
    setRequestLogs(prev => [log, ...prev])
  }

  return (
    <ApiGatewayContext.Provider
      value={{
        applications,
        endpoints,
        apiKeys,
        accessControls,
        requestLogs,
        addApplication,
        deleteApplication,
        addEndpoint,
        deleteEndpoint,
        toggleAccess,
        generateNewKey,
        revokeKey,
        addRequestLog
      }}
    >
      {children}
    </ApiGatewayContext.Provider>
  )
}

export function useApiGateway() {
  return useContext(ApiGatewayContext)
}

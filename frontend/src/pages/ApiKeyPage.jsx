import React, { useState, useMemo, useEffect } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Copy, RefreshCw, Ban, CheckCircle2, Loader2, Key } from 'lucide-react'
import api from '../services/api'

export default function ApiKeyPage() {
  const { accessControls, fetchAccessControls, loading } = useApiGateway()
  const { matrix = {}, applications = [] } = accessControls || {}

  const [toastMessage, setToastMessage] = useState('')
  const [generatingId, setGeneratingId] = useState(null)
  const [revokingId, setRevokingId] = useState(null)
  
  // Extract all API keys from matrix that are approved
  const apiKeys = useMemo(() => {
    if (!matrix) return []
    return Object.entries(matrix)
      .filter(([_, v]) => v.status === 'approved' && v.api_key)
      .map(([key, v]) => {
        const [appId, epId] = key.split(':')
        const app = applications.find(a => a.id === Number(appId))
        return {
          id: v.id,
          access_request_id: v.id,
          opd_id: appId,
          endpoint_id: epId,
          api_key: v.api_key,
          opd_name: app?.name || 'Unknown OPD',
          opd_code: app?.code || '-',
          status: v.status,
          is_active: v.is_allowed
        }
      })
  }, [matrix, applications])

  useEffect(() => {
    fetchAccessControls()
  }, [fetchAccessControls])

  const activeCount = useMemo(() => apiKeys.filter(k => k.is_active).length, [apiKeys])

  const maskKey = (key) => {
    if (!key) return '—'
    return key.substring(0, 12) + '••••••••' + key.substring(key.length - 4)
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2800)
  }

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key)
    showToast('API Key berhasil disalin ke clipboard!')
  }

  const handleGenerateNewKey = async (accessId) => {
    if (!confirm('Generate API Key baru untuk akses ini? Key lama akan hangus.')) return
    setGeneratingId(accessId)
    try {
      // Assuming toggle handles regeneration if already approved based on backend logic, 
      // or we can call a dedicated endpoint if available. 
      // Based on AccessControlController logic, toggle on an approved request turns it to rejected.
      // Let's implement a quick API call directly to reset key if we want, or just re-fetch for now.
      showToast('Fitur rotasi key sedang dalam pengembangan (gunakan fitur cabut/beri akses).')
    } catch {
      showToast('Gagal generate key. Coba lagi.')
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md text-slate-900 dark:text-white">
        <div>
          <h3 className="font-extrabold text-base flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Token Akses OPD (API Keys)</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Daftar API Key yang otomatis di-generate ketika hak akses OPD ke sebuah Endpoint disetujui.
            Setiap aplikasi OPD menggunakan header <code className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono">X-API-KEY</code> untuk autentikasi ke Gateway.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 rounded-xl">
            ✓ {activeCount} API Key Aktif
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading.accessControls && (
        <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
      )}

      {/* API Key Cards Grid */}
      {!loading.accessControls && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiKeys.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
              Belum ada API Key yang diterbitkan. Berikan akses pada menu Hak Akses untuk men-generate key otomatis.
            </div>
          )}
          {apiKeys.map(keyObj => (
            <div key={keyObj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-lg">
              {/* App Title & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex flex-wrap items-center gap-2">
                    <span>{keyObj.opd_name}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 max-w-full break-words leading-tight">
                      {keyObj.opd_code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Akses ID: {keyObj.id}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                  keyObj.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                  'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                }`}>
                  ● {keyObj.is_active ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>

              {/* Key Display Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">X-API-KEY</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-blue-500 dark:text-blue-300 font-bold tracking-wider overflow-x-auto select-all">
                    🔒 {maskKey(keyObj.api_key)}
                  </div>
                  <button onClick={() => copyToClipboard(keyObj.api_key)} className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /><span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

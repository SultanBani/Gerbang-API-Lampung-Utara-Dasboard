import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import {
  Send, Building2, Link2, Check, Copy, Key, Clock, CheckCircle, XCircle, Loader2, ExternalLink
} from 'lucide-react'

const getGatewayBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `${window.location.protocol}//${host}:8000/APIGATELU`
    }
  }
  return import.meta.env.VITE_GATEWAY_BASE || 'https://ragem-api.lampungutarakab.go.id/APIGATELU'
}

const GATEWAY_BASE = getGatewayBaseUrl()
const methodColor = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  POST:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
  DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  }
  const icons = {
    pending:  <Clock className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
      {icons[status]} {status?.toUpperCase()}
    </span>
  )
}

export default function OpdRequestsPage() {
  const [myAccessRequests, setMyAccessRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  const copyUrl = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/opd/my-access-requests')
      setMyAccessRequests(res.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch requests:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-500" /> Status Pengajuan Saya
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400">Memuat status pengajuan...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {myAccessRequests.length > 0 ? myAccessRequests.map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.endpoint?.title || 'Endpoint'}</h4>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Pemilik: {req.endpoint?.opd?.name || 'OPD'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(req.requested_methods || []).map(m => (
                        <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[m]}`}>{m}</span>
                      ))}
                    </div>
                  </div>
                  {req.expires_at && (
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500">Kedaluwarsa</div>
                      <div className="text-[11px] text-slate-300 font-mono">{new Date(req.expires_at).toLocaleDateString('id-ID')}</div>
                    </div>
                  )}
                </div>

                {/* Gateway URL — siap dicopy untuk Chrome */}
                {req.status === 'approved' && req.api_key && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-950/60 border border-emerald-200 dark:border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">URL Gateway Siap Akses</span>
                    </div>

                    {/* Full Gateway URL */}
                    <div className="bg-white dark:bg-slate-950/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 group shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL (Akses via Chrome)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-mono text-blue-600 dark:text-blue-300 break-all flex-1 leading-relaxed">
                          {GATEWAY_BASE}/{req.endpoint?.opd?.code || 'opd'}/{req.endpoint?.slug || 'slug'}?api_key={req.api_key}
                        </code>
                        <a
                          href={`${GATEWAY_BASE}/${req.endpoint?.opd?.code || 'opd'}/${req.endpoint?.slug || 'slug'}?api_key=${req.api_key}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                          title="Buka JSON Langsung di Chrome"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka JSON</span>
                        </a>
                        <button
                          onClick={() => copyUrl(
                            `${GATEWAY_BASE}/${req.endpoint?.opd?.code || 'opd'}/${req.endpoint?.slug || 'slug'}?api_key=${req.api_key}`,
                            `url-${req.id}`
                          )}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer shrink-0"
                          title="Salin URL"
                        >
                          {copiedId === `url-${req.id}` ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="bg-white dark:bg-slate-950/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">API Key</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-mono text-amber-600 dark:text-amber-300 truncate flex-1">{req.api_key}</code>
                        <button
                          onClick={() => copyUrl(req.api_key, `apikey-${req.id}`)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer shrink-0"
                          title="Salin API Key"
                        >
                          {copiedId === `apikey-${req.id}` ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Header Alternative */}
                    <div className="text-[11px] text-slate-600 dark:text-slate-500 px-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-400">Alternatif Header:</span>{' '}
                      <code className="text-blue-600 dark:text-blue-400">X-API-KEY: {req.api_key}</code>
                    </div>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Menunggu persetujuan dari pemilik endpoint...
                  </div>
                )}

                {req.status === 'rejected' && (
                  <div className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5" />
                    Permintaan akses ditolak oleh pemilik endpoint.
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-16 text-slate-500">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada pengajuan akses. Buka Katalog API untuk mengajukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

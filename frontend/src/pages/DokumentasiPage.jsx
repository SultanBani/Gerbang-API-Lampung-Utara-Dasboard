import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import {
  BookOpen, Code2, Key, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check,
  Search, FileText, ArrowRight, ExternalLink, Sparkles, Terminal, ChevronDown, ChevronUp, Layers, CheckCircle
} from 'lucide-react'

const methodColors = {
  GET: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
}

const statusCodes = [
  { code: 200, status: 'OK', desc: 'Request berhasil diproses dan data JSON dikembalikan.', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  { code: 401, status: 'Unauthorized', desc: 'API Key / Token autentikasi tidak valid atau belum dikirimkan.', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  { code: 403, status: 'Forbidden', desc: 'Akses ditolak karena Permohonan Hak Akses belum disetujui OPD pemilik.', badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
  { code: 404, status: 'Not Found', desc: 'Route API atau Kode OPD yang dituju tidak ditemukan di Gateway.', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  { code: 502, status: 'Bad Gateway', desc: 'Server asal milik OPD tidak merespons atau mengalami timeout.', badge: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
]

export default function DokumentasiPage() {
  const { endpoints } = useApiGateway()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'guide' | 'endpoints' | 'errors'
  const [searchDoc, setSearchDoc] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getBaseGatewayUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
        return `${window.location.protocol}//${host}:8000/APIGATELU`
      }
    }
    return 'https://ragem-api.lampungutarakab.go.id/APIGATELU'
  }

  const baseUrl = getBaseGatewayUrl()

  const filteredEndpoints = useMemo(() => {
    if (!searchDoc.trim()) return endpoints
    const q = searchDoc.toLowerCase()
    return endpoints.filter(ep =>
      ep.title?.toLowerCase().includes(q) ||
      ep.slug?.toLowerCase().includes(q) ||
      ep.opd?.name?.toLowerCase().includes(q) ||
      ep.opd?.code?.toLowerCase().includes(q)
    )
  }, [endpoints, searchDoc])

  return (
    <div className="space-y-6">

      {/* ─── Top Header Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-cyan-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi Integrasi APIGATE v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Panduan & Dokumentasi Integrasi Data APIGATE
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
            Petunjuk lengkap penggunaan Gateway Interoperabilitas Data Kabupaten Lampung Utara untuk <strong>Pengambilan Data (GET)</strong> dan <strong>Penginputan Data (POST)</strong> antar-OPD.
          </p>

          {/* Quick Base URL Badge */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-300">Base Gateway URL:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-cyan-300 font-bold">
              <span>{baseUrl}</span>
              <button
                onClick={() => copyToClipboard(baseUrl, 'baseurl')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Salin Base URL"
              >
                {copiedKey === 'baseurl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: '📌 Ringkasan Sistem', icon: BookOpen },
          { id: 'guide', label: '🚀 Cara Menggunakan (Alur GET & POST)', icon: ArrowRight },
          { id: 'endpoints', label: `🌐 Daftar Service API (${endpoints.length})`, icon: Layers },
          { id: 'errors', label: '⚠️ Format Respons & Status HTTP', icon: AlertCircle },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── TAB 1: RINGKASAN SISTEM (OVERVIEW) ────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Apa itu APIGET */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Apa itu APIGATE Lampung Utara?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>APIGATE</strong> (Gateway Interoperabilitas Data) adalah platform resmi Kabupaten Lampung Utara yang memungkinkan seluruh Organisasi Perangkat Daerah (OPD) untuk saling <strong>berbagi pakai data</strong> secara aman, terpusat, dan cepat tanpa perlu membangun koneksi jaringan terpisah.
              </p>
            </div>

            {/* Card 2: 2 Fungsi Utama */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Dua Fungsi Utama APIGATE
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold text-[10px]">GET</span>
                  <span><strong>Pengambilan Data</strong>: Mengambil dataset resmi (JSON/CSV) milik OPD lain untuk diintegrasikan ke aplikasi internal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono font-bold text-[10px]">POST</span>
                  <span><strong>Penginputan Data</strong>: Mengirimkan atau mengunggah data baru ke server OPD produsen secara otomatis.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Format Autentikasi Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Format Autentikasi Header API Key
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Setiap panggilan request ke Gateway wajib menyertakan <strong>API Key</strong> yang sudah disetujui pada HTTP Request Header atau Query Parameter:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Metode 1: HTTP Header (Direkomendasikan)</span>
                <code className="text-cyan-400 block">X-API-KEY: gkp_disdukcapil_x89a23b...</code>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Metode 2: Query Parameter (Untuk Browser)</span>
                <code className="text-emerald-400 block">?api_key=gkp_disdukcapil_x89a23b...</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CARA MENGGUNAKAN (ALUR GET & POST) ─────────────── */}
      {activeTab === 'guide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Section: Alur Pengambilan Data (GET) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs">GET</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Alur Pengambilan Data (Membaca Data OPD Lain)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Cari di Katalog API</h4>
                <p className="text-slate-500 leading-relaxed">Buka menu <strong>Katalog API</strong>, lalu temukan data yang dibutuhkan (misal: PAD BPKAD / Data Penduduk Dukcapil).</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Minta Hak Akses</h4>
                <p className="text-slate-500 leading-relaxed">Klik tombol <strong>"🔑 Minta Hak Akses"</strong>. Setelah disetujui OPD pemilik, salin <strong>API Key</strong> resmi Anda.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Eksekusi / Panggil API</h4>
                <p className="text-slate-500 leading-relaxed">Gunakan <strong>API Tester</strong> atau pasang kodingan cURL/JS di aplikasi Anda untuk langsung menerima data JSON.</p>
              </div>
            </div>
          </div>

          {/* Section: Alur Penginputan Data (POST) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 font-mono font-bold text-xs">POST</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Alur Penginputan & Pengunggahan Data (OPD Produsen)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Buka Menu "Input & Kelola Data"</h4>
                <p className="text-slate-500 leading-relaxed">Pilih menu <strong>Input & Kelola API Saya</strong> di navigasi kiri, lalu klik <strong>"Tambah / Upload Data Baru"</strong>.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Unggah File / Target URL</h4>
                <p className="text-slate-500 leading-relaxed">Unggah file dataset CSV/PDF/JSON milik OPD Anda atau masukkan URL server internal.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Publikasikan ke Katalog</h4>
                <p className="text-slate-500 leading-relaxed">Setelah disimpan, API Anda otomatis aktif dan siap dibuka untuk permohonan akses dari OPD lain.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 3: DAFTAR SERVICE API AKTIF ───────────────────────── */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchDoc}
              onChange={e => setSearchDoc(e.target.value)}
              placeholder="Cari nama endpoint, OPD, atau route..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Endpoints List */}
          {filteredEndpoints.length > 0 ? (
            <div className="space-y-3">
              {filteredEndpoints.map(ep => {
                const isExpanded = expandedId === ep.id
                const gatewayRoute = `${baseUrl}/${ep.opd?.code || 'opd'}/${ep.slug}`

                return (
                  <div
                    key={ep.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{ep.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {ep.opd?.name || 'OPD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(ep.method_permissions || ['GET']).map(m => (
                            <span key={m} className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${methodColors[m] || 'bg-slate-100 text-slate-600'}`}>
                              {m}
                            </span>
                          ))}
                          <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 break-all">
                            /{ep.opd?.code || 'opd'}/{ep.slug}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-[11px] font-bold text-blue-500 hover:underline">
                          {isExpanded ? 'Sembunyikan Kode' : 'Lihat Contoh Kode'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded Code & Specs */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                        <div className="space-y-1 font-mono text-xs">
                          <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Gateway Public Route URL:</span>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
                            <span className="truncate flex-1">{gatewayRoute}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(gatewayRoute, `route-${ep.id}`) }}
                              className="text-slate-400 hover:text-white font-sans text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                            >
                              {copiedKey === `route-${ep.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === `route-${ep.id}` ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>

                        {/* cURL Integration Code Sample */}
                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex items-center justify-between text-[10px] font-sans font-bold text-slate-400 uppercase">
                            <span>Contoh Kode Integrasi (cURL):</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const curlCode = `curl -X GET "${gatewayRoute}" \\\n  -H "X-API-KEY: API_KEY_ANDA"`
                                copyToClipboard(curlCode, `curl-${ep.id}`)
                              }}
                              className="text-blue-500 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              {copiedKey === `curl-${ep.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === `curl-${ep.id}` ? 'Tersalin' : 'Salin cURL'}</span>
                            </button>
                          </div>
                          <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed text-[11px]">
                            <code>{`curl -X GET "${gatewayRoute}" \\\n  -H "X-API-KEY: API_KEY_ANDA"`}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada service API yang cocok dengan kata kunci pencarian.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: FORMAT RESPONS & STATUS HTTP ────────────────────── */}
      {activeTab === 'errors' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              Tabel Kode Status HTTP & Diagnostik Error
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="pb-3">Kode Status</th>
                    <th className="pb-3">Status Name</th>
                    <th className="pb-3">Keterangan & Solusi Diagnostik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {statusCodes.map(s => (
                    <tr key={s.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-black text-sm">
                        <span className={`px-2.5 py-1 rounded-lg border ${s.badge}`}>{s.code}</span>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">{s.status}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{s.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

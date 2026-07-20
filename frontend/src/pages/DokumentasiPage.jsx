import React, { useState, useMemo } from 'react'
import { useApiGateway } from '../context/ApiGatewayContext'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export default function DokumentasiPage() {
  const { endpoints } = useApiGateway()

  const [selectedTag, setSelectedTag] = useState('all')
  const [expandedDocs, setExpandedDocs] = useState({ 1: true })
  const [aiQueryInput, setAiQueryInput] = useState('')

  const filteredEndpoints = useMemo(() => {
    if (selectedTag === 'all') {
      return endpoints
    }
    return endpoints.filter(e => e.tag === selectedTag)
  }, [endpoints, selectedTag])

  const toggleDoc = (id) => {
    setExpandedDocs(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAskAiDocs = () => {
    if (!aiQueryInput) return
    alert(`Pertanyaan AI Assistant: "${aiQueryInput}"\n\nGunakan Widget AI pada pojok kanan bawah untuk interaksi chat langsung!`)
    setAiQueryInput('')
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
              ● OpenAPI Specification 3.0
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-400 font-mono">v1.0.0</span>
          </div>
          <h3 className="font-extrabold text-base">Dokumentasi API Gateway Lampung Utara</h3>
          <p className="text-xs text-slate-300 dark:text-slate-400 mt-1">
            Base URL Server Publik: <code className="bg-slate-950 px-2 py-0.5 rounded text-blue-400 font-mono">https://api.lampungutarakab.go.id</code>
          </p>
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-300 dark:text-slate-400">Tag:</label>
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Tag Group</option>
            <option value="Pegawai">Pegawai</option>
            <option value="Auth">Auth</option>
            <option value="OPD">OPD</option>
            <option value="Penduduk">Penduduk</option>
          </select>
        </div>
      </div>

      {/* AI Documentation Assistant Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-slate-900 border border-blue-500/30 shadow-sm dark:shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">AI Documentation Assistant</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tanyakan cara menggunakan API, parameter, atau contoh kode langsung ke AI.</p>
          </div>
        </div>
        <div className="flex gap-2 max-w-xl">
          <input
            value={aiQueryInput}
            onChange={e => setAiQueryInput(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && handleAskAiDocs()}
            type="text"
            placeholder='Contoh: "Bagaimana cara mengambil data pegawai SIMPEG?"'
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <button
            onClick={handleAskAiDocs}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tanya AI</span>
          </button>
        </div>
      </div>

      {/* Documentation Endpoints List */}
      <div className="space-y-4">
        {filteredEndpoints.map(ep => {
          const isExpanded = !!expandedDocs[ep.id]
          return (
            <div
              key={ep.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-all"
            >
              {/* Card Header (Click to expand) */}
              <div
                onClick={() => toggleDoc(ep.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono border ${
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                      ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                      ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{ep.url}</code>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {ep.tag}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{ep.description}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Parameters & Headers */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">📌 Headers Wajib</h5>
                        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-400 dark:text-blue-300 leading-relaxed">
                          <div>Authorization: Bearer &#123;API_KEY&#125;</div>
                          <div>Accept: application/json</div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">📌 Query Parameters</h5>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                              <th className="pb-2">Parameter</th>
                              <th className="pb-2">Tipe</th>
                              <th className="pb-2">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                            <tr>
                              <td className="py-2 font-mono text-blue-600 dark:text-blue-400">page</td>
                              <td className="py-2 text-slate-500 dark:text-slate-400 font-mono">integer</td>
                              <td className="py-2 text-slate-500 dark:text-slate-400">Nomor halaman (default: 1)</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-mono text-blue-600 dark:text-blue-400">per_page</td>
                              <td className="py-2 text-slate-500 dark:text-slate-400 font-mono">integer</td>
                              <td className="py-2 text-slate-500 dark:text-slate-400">Jumlah data (max: 100)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Response JSON 200 OK */}
                    <div>
                      <h5 className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">✅ Response 200 OK</h5>
                      <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                        <code>{`{\n  "success": true,\n  "message": "Request berhasil diproses",\n  "data": [\n    {\n      "id": 1,\n      "nama": "Ahmad Budi S.",\n      "opd": "BKPSDM"\n    }\n  ]\n}`}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Code Snippets Tab */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">💻 Contoh Kode Implementasi Klien</h5>
                    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
                      <div>// Example in PHP Laravel (Http Client)</div>
                      <div className="text-slate-300 mt-1">
                        $response = Http::withToken('<span className="text-amber-300">API_KEY_ANDA</span>')<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;-&gt;get('<span className="text-emerald-300">https://api.lampungutarakab.go.id{ep.url}</span>');<br />
                        $data = $response-&gt;json();
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

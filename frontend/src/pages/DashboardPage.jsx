import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApiGateway } from '../context/ApiGatewayContext'
import { useTheme } from '../context/ThemeContext'
import { Line, Doughnut } from 'react-chartjs-2'
import { Loader2 } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
)

function StatCard({ icon, value, label, hint, hintColor = 'text-emerald-600 dark:text-emerald-400', accentColor = 'blue', loading }) {
  const colors = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',   blur: 'bg-blue-500/10 group-hover:bg-blue-500/20',   border: 'hover:border-blue-300' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', blur: 'bg-indigo-500/10 group-hover:bg-indigo-500/20', border: 'hover:border-indigo-300' },
    emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-600 dark:text-emerald-400', blur:'bg-emerald-500/10 group-hover:bg-emerald-500/20', border:'hover:border-emerald-300' },
    amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',  blur: 'bg-amber-500/10 group-hover:bg-amber-500/20',  border: 'hover:border-amber-300' },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-600 dark:text-red-400',     blur: 'bg-red-500/10 group-hover:bg-red-500/20',     border: 'hover:border-red-300' },
  }
  const c = colors[accentColor] || colors.blue
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${c.border} dark:hover:border-slate-700 shadow-sm dark:shadow-md group`}>
      <div className={`absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 ${c.blur}`}></div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${c.bg} ${c.text}`}>{icon}</div>
      {loading
        ? <div className="h-8 flex items-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        : <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{value}</p>
      }
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{label}</span>
      {hint && <span className={`text-[10px] font-bold block mt-2 ${hintColor}`}>{hint}</span>}
    </div>
  )
}

export default function DashboardPage() {
  const { stats, fetchStats, fetchLogs, logs, loading } = useApiGateway()
  const { isDark } = useTheme()

  useEffect(() => {
    fetchStats()
    fetchLogs({ per_page: 5 })
  }, [fetchStats, fetchLogs])

  const textColor  = isDark ? '#94a3b8' : '#475569'
  const gridColor  = isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(203, 213, 225, 0.5)'
  const isLoading  = loading.stats

  // Traffic chart dari data real (7 hari terakhir)
  const trafficChart = stats?.traffic_chart ?? []
  const lineChartData = {
    labels: trafficChart.map(d => d.date),
    datasets: [
      {
        label: 'Total Request',
        data: trafficChart.map(d => d.total),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#3b82f6', borderWidth: 2,
      },
      {
        label: 'Request Gagal',
        data: trafficChart.map(d => d.failed),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#ef4444', borderWidth: 2,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor, font: { family: 'sans-serif', size: 11 } } } },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
    },
  }

  // Distribusi status code dari stats
  const statusDist = stats?.status_distribution ?? {}
  const doughnutData = Object.entries(statusDist)
  const doughnutChartData = {
    labels: doughnutData.map(([code]) => `${code}`),
    datasets: [{
      data: doughnutData.map(([, count]) => count),
      backgroundColor: doughnutData.map(([code]) =>
        code.startsWith('2') ? 'rgba(16,185,129,0.8)' :
        code.startsWith('4') ? 'rgba(245,158,11,0.8)' :
        'rgba(239,68,68,0.8)'
      ),
      borderColor: doughnutData.map(([code]) =>
        code.startsWith('2') ? '#10b981' : code.startsWith('4') ? '#f59e0b' : '#ef4444'
      ),
      borderWidth: 1.5,
    }],
  }
  const doughnutChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, padding: 12 } } },
    cutout: '70%',
  }

  // Recent logs dari fetchLogs
  const recentLogs = useMemo(() => {
    const items = logs?.data ?? []
    return items.slice(0, 5)
  }, [logs])

  return (
    <div className="space-y-8">
      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard icon="🗂️" value={stats?.total_applications ?? '—'} label="Aplikasi Terdaftar" hint="↑ 2 bulan ini" accentColor="blue" loading={isLoading} />
        <StatCard icon="⚙️" value={stats?.total_endpoints ?? '—'} label="Total Endpoint" hint="↑ 5 baru didaftarkan" accentColor="indigo" loading={isLoading} />
        <StatCard icon="🗝️" value={stats?.active_keys ?? '—'} label="API Key Aktif" hint="Semua berjalan normal" hintColor="text-slate-500 dark:text-slate-400" accentColor="emerald" loading={isLoading} />
        <StatCard icon="📥" value={stats?.total_hits_today ?? '—'} label="Request Hari Ini" hint={stats?.failed_hits_today != null ? `${stats.failed_hits_today} gagal` : ''} accentColor="amber" loading={isLoading} />
        <StatCard icon="⚠️" value={stats?.failed_hits_today ?? '—'} label="Request Gagal" hint="Error terdeteksi" hintColor="text-red-600 dark:text-red-400" accentColor="red" loading={isLoading} />
        <StatCard icon="⚡" value={stats?.avg_response_time != null ? `${stats.avg_response_time}ms` : '—'} label="Avg Response" hint="Rata-rata latency" accentColor="emerald" loading={isLoading} />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-2 shadow-sm dark:shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span>📈</span> Volume Request 7 Hari Terakhir
          </h3>
          <div className="h-64">
            {isLoading
              ? <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
              : <Line data={lineChartData} options={lineChartOptions} />
            }
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span>🍩</span> Distribusi Status Response HTTP
          </h3>
          <div className="h-64 flex items-center justify-center">
            {isLoading
              ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              : doughnutData.length > 0
                ? <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                : <p className="text-xs text-slate-400">Belum ada data log</p>
            }
          </div>
        </div>
      </div>

      {/* RECENT LOGS & AI ADVISOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Log Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>📋</span> Log Request Terbaru
            </h3>
            <Link to="/logs" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">Semua Log →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Aplikasi</th>
                  <th className="pb-3">Endpoint</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading.logs
                  ? <tr><td colSpan="5" className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></td></tr>
                  : recentLogs.length === 0
                    ? <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-xs">Belum ada data log</td></tr>
                    : recentLogs.map(log => {
                        const sc = log.status_code
                        const time = log.created_at?.split('T')[1]?.substring(0, 8) ?? log.created_at?.split(' ')[1] ?? '—'
                        const appName = log.application?.name ?? '—'
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{time}</td>
                            <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{appName}</td>
                            <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 ${
                                log.method === 'GET'    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                log.method === 'POST'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                log.method === 'PUT'    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>{log.method}</span>
                              <code>{log.url}</code>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                sc >= 500 ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30' :
                                sc >= 400 ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' :
                                'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              }`}>{sc}</span>
                            </td>
                            <td className="py-3 text-right font-mono text-slate-500 dark:text-slate-400">{log.response_time_ms}ms</td>
                          </tr>
                        )
                      })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Security Advisor & Top Usage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm dark:shadow-lg">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <span>💡</span> Analisis Keamanan & Rekomendasi AI
            </h3>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/30 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                  <span>🤖</span> AI Security Advisor
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">Live Scan</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Endpoint <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-mono">POST /v1/auth/login</code> belum memiliki Rate Limit ketat.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Periksa API Key yang mendekati masa kedaluwarsa (<strong className="text-slate-900 dark:text-slate-100">{stats?.active_keys ?? 0} aktif</strong>).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400">•</span>
                  <span>Rekomendasi: Lakukan rotasi API Key berkala untuk seluruh {stats?.total_applications ?? 0} aplikasi yang terdaftar.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Top Apps dari stats */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aplikasi Terbanyak Request (7 Hari)</h4>
            <div className="space-y-2.5">
              {(stats?.top_applications ?? []).slice(0, 3).map((app, i) => {
                const maxHits = stats?.top_applications?.[0]?.hits ?? 1
                const pct = Math.round((app.hits / maxHits) * 100)
                const colors = ['bg-blue-600 dark:bg-blue-500', 'bg-indigo-600 dark:bg-indigo-500', 'bg-violet-600 dark:bg-violet-500']
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-800 dark:text-slate-300 font-bold">{app.application} <span className="text-slate-400 font-normal">({app.opd})</span></span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{app.hits} req ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                      <div className={`${colors[i]} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
              {!stats?.top_applications?.length && !isLoading && (
                <p className="text-xs text-slate-400">Belum ada data request.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

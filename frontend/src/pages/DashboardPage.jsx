import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApiGateway } from '../context/ApiGatewayContext'
import { useTheme } from '../context/ThemeContext'
import { Line, Doughnut } from 'react-chartjs-2'
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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

export default function DashboardPage() {
  const { applications, endpoints, apiKeys, requestLogs } = useApiGateway()
  const { isDark } = useTheme()

  const activeKeysCount = useMemo(() => {
    return apiKeys.filter(k => k.status === 'active').length
  }, [apiKeys])

  const textColor = isDark ? '#94a3b8' : '#475569'
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(203, 213, 225, 0.5)'

  const lineChartData = {
    labels: ['Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Senin', 'Selasa', 'Rabu'],
    datasets: [
      {
        label: 'Total Request',
        data: [3200, 4100, 3800, 5200, 4600, 4200, 4821],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        borderWidth: 2
      },
      {
        label: 'Request Gagal',
        data: [45, 62, 38, 80, 52, 41, 37],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        borderWidth: 2
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'sans-serif', size: 11 } } }
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } }
    }
  }

  const doughnutChartData = {
    labels: ['200 OK', '401 Unauthorized', '403 Forbidden', '500 Server Error'],
    datasets: [{
      data: [4621, 98, 65, 37],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(99, 102, 241, 0.8)'],
      borderColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
      borderWidth: 1.5
    }]
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, padding: 12 } }
    },
    cutout: '70%'
  }

  return (
    <div className="space-y-8">
      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Card 1: Aplikasi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-blue-500/10 group-hover:bg-blue-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-blue-500/10 text-blue-600 dark:text-blue-400">🗂️</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{applications.length}</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Aplikasi Terdaftar</span>
          <span className="text-[10px] font-bold block mt-2 text-emerald-600 dark:text-emerald-400">↑ 2 bulan ini</span>
        </div>

        {/* Card 2: Endpoints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-indigo-500/10 group-hover:bg-indigo-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">⚙️</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{endpoints.length}</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Endpoint</span>
          <span className="text-[10px] font-bold block mt-2 text-emerald-600 dark:text-emerald-400">↑ 5 baru didaftarkan</span>
        </div>

        {/* Card 3: API Key Aktif */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-emerald-500/10 group-hover:bg-emerald-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">🗝️</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{activeKeysCount}</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">API Key Aktif</span>
          <span className="text-[10px] font-bold block mt-2 text-slate-500 dark:text-slate-400">Semua berjalan normal</span>
        </div>

        {/* Card 4: Request Hari Ini */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-amber-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-amber-500/10 group-hover:bg-amber-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-amber-500/10 text-amber-600 dark:text-amber-400">📥</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">4,821</p>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Request Hari Ini</span>
          <span class="text-[10px] font-bold block mt-2 text-emerald-600 dark:text-emerald-400">↑ 12% dari kemarin</span>
        </div>

        {/* Card 5: Request Gagal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-red-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-red-500/10 group-hover:bg-red-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-red-500/10 text-red-600 dark:text-red-400">⚠️</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">37</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Request Gagal</span>
          <span className="text-[10px] font-bold block mt-2 text-red-600 dark:text-red-400">↑ 8 error terdeteksi</span>
        </div>

        {/* Card 6: Uptime Gateway */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md group">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 bg-emerald-500/10 group-hover:bg-emerald-500/20"></div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">⚡</div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">98.4%</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Uptime Gateway</span>
          <span className="text-[10px] font-bold block mt-2 text-emerald-600 dark:text-emerald-400">Sangat Stabil</span>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-2 shadow-sm dark:shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span>📈</span> Volume Request 7 Hari Terakhir
          </h3>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span>🍩</span> Distribusi Status Response HTTP
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
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
                {requestLogs.slice(0, 5).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{log.timestamp.split(' ')[1]}</td>
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{log.appName}</td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 ${
                        log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        log.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        log.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {log.method}
                      </span>
                      <code>{log.url}</code>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.statusCode >= 400 ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500 dark:text-slate-400">{log.responseTimeMs}ms</td>
                  </tr>
                ))}
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
                  <span>Endpoint <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-mono">POST /api/auth/login</code> belum memiliki Rate Limit ketat.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Aplikasi <strong className="text-slate-900 dark:text-slate-100">PPDB</strong> menggunakan Token yang telah expired pada Juni 2026.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400">•</span>
                  <span>Rekomendasi: Lakukan rotasi API Key berkala untuk aplikasi <strong className="text-slate-900 dark:text-slate-100">SIAK</strong>.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Top Usage Progress Bars */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aplikasi Penggunaan Data Terbesar</h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 dark:text-slate-300 font-bold">SIMPEG (BKPSDM)</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">1,840 req (82%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 dark:text-slate-300 font-bold">E-Office (Diskominfo)</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">1,203 req (60%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 dark:text-slate-300 font-bold">Absensi ASN</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">887 req (42%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                  <div className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

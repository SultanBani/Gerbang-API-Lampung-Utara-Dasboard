<template>
  <div class="space-y-6">
    <!-- Header Controls & Filters -->
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
      <div class="flex flex-1 flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[240px]">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari aplikasi, URL, atau IP Address..."
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
          />
        </div>

        <select v-model="filterApp" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 shadow-sm">
          <option value="all">Semua Aplikasi</option>
          <option v-for="app in store.applications" :key="app.id" :value="app.name">{{ app.name }}</option>
        </select>

        <select v-model="filterStatus" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 shadow-sm">
          <option value="all">Semua Status</option>
          <option value="200">200 OK</option>
          <option value="401">401 Unauthorized</option>
          <option value="403">403 Forbidden</option>
          <option value="500">500 Server Error</option>
        </select>
      </div>

      <button
        @click="exportCsv"
        class="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <span>📥</span>
        <span>Export CSV</span>
      </button>
    </div>

    <!-- Log Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-5">Waktu Transaksi</th>
              <th class="py-3.5 px-5">Aplikasi Klien</th>
              <th class="py-3.5 px-5">Method</th>
              <th class="py-3.5 px-5">URL Endpoint</th>
              <th class="py-3.5 px-5 text-center">Status</th>
              <th class="py-3.5 px-5 text-right">Latency</th>
              <th class="py-3.5 px-5">IP Address</th>
              <th class="py-3.5 px-5 text-center">Analisis AI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              :class="[
                'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors',
                log.statusCode >= 400 ? 'bg-red-500/5' : ''
              ]"
            >
              <td class="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{{ log.timestamp }}</td>
              <td class="py-4 px-5 font-bold text-slate-900 dark:text-slate-200">{{ log.appName }}</td>
              <td class="py-4 px-5">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
                    log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : '',
                    log.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : '',
                    log.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : '',
                    log.method === 'DELETE' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : ''
                  ]"
                >
                  {{ log.method }}
                </span>
              </td>
              <td class="py-4 px-5 font-mono text-slate-800 dark:text-slate-200">
                <code>{{ log.url }}</code>
              </td>
              <td class="py-4 px-5 text-center">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border',
                    log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : '',
                    log.statusCode === 401 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' : '',
                    log.statusCode === 403 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' : '',
                    log.statusCode === 500 ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30' : ''
                  ]"
                >
                  {{ log.statusCode }}
                </span>
              </td>
              <td class="py-4 px-5 text-right font-mono text-slate-500 dark:text-slate-400">{{ log.responseTimeMs }}ms</td>
              <td class="py-4 px-5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{{ log.ipAddress }}</td>
              <td class="py-4 px-5 text-center">
                <button
                  v-if="log.statusCode >= 400"
                  @click="openAiAnalysis(log)"
                  class="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 mx-auto"
                >
                  <span>🤖</span> Analisis AI
                </button>
                <span v-else class="text-slate-400 dark:text-slate-600">—</span>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                Tidak ada log transaksi yang sesuai filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI Error Analysis Modal -->
    <div v-if="selectedLogForAi" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">
          <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-sm">
            <span>🤖</span> AI Error Analyzer — Status {{ selectedLogForAi.statusCode }}
          </div>
          <button @click="selectedLogForAi = null" class="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base">✕</button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <!-- Log Summary -->
          <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
            <div><span class="text-slate-500">Aplikasi:</span> <strong class="text-slate-800 dark:text-slate-200">{{ selectedLogForAi.appName }}</strong></div>
            <div><span class="text-slate-500">Endpoint:</span> <strong class="text-blue-600 dark:text-blue-400">{{ selectedLogForAi.method }} {{ selectedLogForAi.url }}</strong></div>
            <div><span class="text-slate-500">Waktu:</span> <span class="text-slate-600 dark:text-slate-300">{{ selectedLogForAi.timestamp }}</span></div>
          </div>

          <!-- Analysis Output -->
          <div class="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3 leading-relaxed">
            <h4 class="font-extrabold text-amber-700 dark:text-amber-300 text-xs">🔍 Analisis & Rekomendasi Solusi:</h4>
            <p class="text-slate-700 dark:text-slate-300 whitespace-pre-line">{{ selectedLogForAi.aiAnalysis || 'Analisis otomatis: Terjadi kendala saat memproses request pada server gateway.' }}</p>
          </div>

          <div class="pt-2 text-[10px] text-slate-500 text-center">
            ⚡ Analisis ini diproduksi secara real-time oleh Modul AI Gateway Assistant.
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            @click="selectedLogForAi = null"
            class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const searchQuery = ref('')
const filterApp = ref('all')
const filterStatus = ref('all')
const selectedLogForAi = ref(null)

const filteredLogs = computed(() => {
  return store.requestLogs.filter(log => {
    const matchQuery =
      log.appName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.url.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.ipAddress.includes(searchQuery.value)

    const matchApp = filterApp.value === 'all' || log.appName === filterApp.value
    const matchStatus = filterStatus.value === 'all' || log.statusCode === Number(filterStatus.value)

    return matchQuery && matchApp && matchStatus
  })
})

const openAiAnalysis = (log) => {
  selectedLogForAi.value = log
}

const exportCsv = () => {
  const headers = ['Timestamp', 'Application', 'Method', 'URL', 'StatusCode', 'LatencyMs', 'IPAddress']
  const rows = filteredLogs.value.map(l => [
    l.timestamp, l.appName, l.method, l.url, l.statusCode, l.responseTimeMs, l.ipAddress
  ])
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `log-request-gerbang-api-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

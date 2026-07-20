<template>
  <div class="space-y-6">
    <!-- Filter and Info Header -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🔐</span> Matriks Authorization API Gateway
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tentukan aplikasi OPD mana saja yang diizinkan mengakses endpoint tertentu. Klik toggle untuk mengubah perizinan secara langsung.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-slate-600 dark:text-slate-400">Filter Aplikasi:</label>
        <select v-model="selectedAppId" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm">
          <option value="all">Tampilkan Semua Aplikasi</option>
          <option v-for="app in store.applications" :key="app.id" :value="app.id">
            {{ app.name }} ({{ app.opd }})
          </option>
        </select>
      </div>
    </div>

    <!-- Authorization Matrix Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th class="py-4 px-6 min-w-[240px]">Endpoint API</th>
              <th
                v-for="app in displayedApps"
                :key="app.id"
                class="py-4 px-4 text-center min-w-[110px]"
              >
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ app.name }}</div>
                <div class="text-[9px] text-slate-500 dark:text-slate-400 font-normal lowercase tracking-normal">{{ app.opd }}</div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-for="ep in store.endpoints" :key="ep.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <!-- Endpoint Column -->
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : '',
                      ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : '',
                      ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : '',
                      ep.method === 'DELETE' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : ''
                    ]"
                  >
                    {{ ep.method }}
                  </span>
                  <code class="font-mono text-slate-800 dark:text-slate-200 font-bold text-xs">{{ ep.url }}</code>
                </div>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{{ ep.description }}</span>
              </td>

              <!-- Matrix Toggle Cells -->
              <td
                v-for="app in displayedApps"
                :key="app.id"
                class="py-3.5 px-4 text-center"
              >
                <button
                  @click="store.toggleAccess(app.id, ep.id)"
                  :class="[
                    'w-11 h-6 rounded-full transition-all duration-200 relative p-1 focus:outline-none shadow-inner',
                    isAllowed(app.id, ep.id) ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  ]"
                  :title="`${app.name} -> ${ep.method} ${ep.url}: ${isAllowed(app.id, ep.id) ? 'Diizinkan' : 'Ditolak'}`"
                >
                  <span
                    :class="[
                      'w-4 h-4 rounded-full bg-white block transition-transform duration-200 shadow-md',
                      isAllowed(app.id, ep.id) ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  ></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Legend -->
      <div class="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span>Diizinkan (200 OK)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 inline-block"></span>
            <span>Ditolak (403 Forbidden)</span>
          </div>
        </div>
        <span class="text-[11px] text-slate-500">
          * Perubahan hak akses akan langsung aktif pada API Gateway Engine tanpa perlu restart server.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const selectedAppId = ref('all')

const displayedApps = computed(() => {
  if (selectedAppId.value === 'all') {
    return store.applications
  }
  return store.applications.filter(a => a.id === Number(selectedAppId.value))
})

const isAllowed = (appId, endpointId) => {
  const key = `${appId}_${endpointId}`
  return !!store.accessControls[key]
}
</script>

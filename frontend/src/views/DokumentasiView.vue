<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
            ● OpenAPI Specification 3.0
          </span>
          <span class="text-xs text-slate-300 dark:text-slate-400 font-mono">v1.0.0</span>
        </div>
        <h3 class="font-extrabold text-base">Dokumentasi API Gateway Lampung Utara</h3>
        <p class="text-xs text-slate-300 dark:text-slate-400 mt-1">
          Base URL Server Publik: <code class="bg-slate-950 px-2 py-0.5 rounded text-blue-400 font-mono">https://api.lampungutarakab.go.id</code>
        </p>
      </div>

      <!-- Tag Filter -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-slate-300 dark:text-slate-400">Tag:</label>
        <select v-model="selectedTag" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500">
          <option value="all">Semua Tag Group</option>
          <option value="Pegawai">Pegawai</option>
          <option value="Auth">Auth</option>
          <option value="OPD">OPD</option>
          <option value="Penduduk">Penduduk</option>
        </select>
      </div>
    </div>

    <!-- AI Documentation Assistant Banner -->
    <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-slate-900 border border-blue-500/30 shadow-sm dark:shadow-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
          🤖
        </div>
        <div>
          <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">AI Documentation Assistant</h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Tanyakan cara menggunakan API, parameter, atau contoh kode langsung ke AI.</p>
        </div>
      </div>
      <div class="flex gap-2 max-w-xl">
        <input
          v-model="aiQueryInput"
          @keyup.enter="askAiDocs"
          type="text"
          placeholder='Contoh: "Bagaimana cara mengambil data pegawai SIMPEG?"'
          class="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
        />
        <button
          @click="askAiDocs"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all"
        >
          ✨ Tanya AI
        </button>
      </div>
    </div>

    <!-- Documentation Endpoints List -->
    <div class="space-y-4">
      <div
        v-for="ep in filteredEndpoints"
        :key="ep.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-all"
      >
        <!-- Card Header (Click to expand) -->
        <div
          @click="toggleDoc(ep.id)"
          class="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
        >
          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono border',
                ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : '',
                ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' : '',
                ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' : '',
                ep.method === 'DELETE' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' : ''
              ]"
            >
              {{ ep.method }}
            </span>
            <code class="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{{ ep.url }}</code>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {{ ep.tag }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{{ ep.description }}</span>
            <span class="text-slate-400 text-xs font-bold">{{ expandedDocs[ep.id] ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- Card Expanded Content -->
        <div v-if="expandedDocs[ep.id]" class="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left: Parameters & Headers -->
            <div class="space-y-4">
              <div>
                <h5 class="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">📌 Headers Wajib</h5>
                <div class="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-400 dark:text-blue-300 leading-relaxed">
                  <div>Authorization: Bearer {API_KEY}</div>
                  <div>Accept: application/json</div>
                </div>
              </div>

              <div>
                <h5 class="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">📌 Query Parameters</h5>
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                      <th class="pb-2">Parameter</th>
                      <th class="pb-2">Tipe</th>
                      <th class="pb-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2 font-mono text-blue-600 dark:text-blue-400">page</td>
                      <td class="py-2 text-slate-500 dark:text-slate-400 font-mono">integer</td>
                      <td class="py-2 text-slate-500 dark:text-slate-400">Nomor halaman (default: 1)</td>
                    </tr>
                    <tr>
                      <td class="py-2 font-mono text-blue-600 dark:text-blue-400">per_page</td>
                      <td class="py-2 text-slate-500 dark:text-slate-400 font-mono">integer</td>
                      <td class="py-2 text-slate-500 dark:text-slate-400">Jumlah data (max: 100)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right: Response JSON 200 OK -->
            <div>
              <h5 class="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">✅ Response 200 OK</h5>
              <pre class="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto"><code>{
  "success": true,
  "message": "Request berhasil diproses",
  "data": [
    {
      "id": 1,
      "nama": "Ahmad Budi S.",
      "opd": "BKPSDM"
    }
  ]
}</code></pre>
            </div>
          </div>

          <!-- Code Snippets Tab -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h5 class="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">💻 Contoh Kode Implementasi Klien</h5>
            <div class="bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
              <div>// Example in PHP Laravel (Http Client)</div>
              <div class="text-slate-300 mt-1">
                $response = Http::withToken('<span class="text-amber-300">API_KEY_ANDA</span>')<br>
                &nbsp;&nbsp;&nbsp;&nbsp;->get('<span class="text-emerald-300">https://api.lampungutarakab.go.id{{ ep.url }}</span>');<br>
                $data = $response->json();
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const selectedTag = ref('all')
const expandedDocs = ref({ 1: true }) // First one expanded by default
const aiQueryInput = ref('')

const filteredEndpoints = computed(() => {
  if (selectedTag.value === 'all') {
    return store.endpoints
  }
  return store.endpoints.filter(e => e.tag === selectedTag.value)
})

const toggleDoc = (id) => {
  expandedDocs.value[id] = !expandedDocs.value[id]
}

const askAiDocs = () => {
  if (!aiQueryInput.value) return
  alert(`Pertanyaan AI Assistant: "${aiQueryInput.value}"\n\nGunakan Widget AI pada pojok kanan bawah untuk interaksi chat langsung!`)
  aiQueryInput.value = ''
}
</script>

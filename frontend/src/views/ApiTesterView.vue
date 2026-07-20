<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- REQUEST BUILDER PANEL -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📤</span> Request API Builder
          </h3>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Environment: Local Server
          </span>
        </div>

        <!-- App Auto-fill Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pilih Aplikasi Klien (Auto-fill API Key)</label>
          <select v-model="selectedAppId" @change="handleAppSelect" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm">
            <option v-for="appKey in store.apiKeys" :key="appKey.id" :value="appKey.appId">
              {{ appKey.appName }} ({{ appKey.opd }}) — Key: {{ appKey.key.substring(0, 8) }}...
            </option>
          </select>
        </div>

        <!-- URL Input Bar -->
        <div class="flex items-center">
          <select v-model="requestMethod" class="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-xs px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-l-xl border-r-0 focus:outline-none">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            v-model="requestUrl"
            type="text"
            placeholder="/api/pegawai"
            class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 py-2.5 px-3.5 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <button
            @click="sendRequest"
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-r-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <span v-if="loading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>▶</span>
            <span>Send</span>
          </button>
        </div>

        <!-- Request Tabs -->
        <div>
          <div class="flex border-b border-slate-200 dark:border-slate-800 gap-4">
            <button
              @click="activeTab = 'headers'"
              :class="['pb-2 text-xs font-bold transition-all border-b-2', activeTab === 'headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400']"
            >
              Headers (3)
            </button>
            <button
              @click="activeTab = 'body'"
              :class="['pb-2 text-xs font-bold transition-all border-b-2', activeTab === 'body' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400']"
            >
              Body (JSON)
            </button>
            <button
              @click="activeTab = 'params'"
              :class="['pb-2 text-xs font-bold transition-all border-b-2', activeTab === 'params' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400']"
            >
              Params
            </button>
          </div>

          <!-- Headers Content -->
          <div v-if="activeTab === 'headers'" class="py-3 space-y-2 font-mono text-xs">
            <div class="flex items-center gap-2">
              <input type="text" value="Authorization" readonly class="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 dark:text-slate-600">:</span>
              <input type="text" :value="`Bearer ${currentApiKey}`" readonly class="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            </div>
            <div class="flex items-center gap-2">
              <input type="text" value="Accept" readonly class="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 dark:text-slate-600">:</span>
              <input type="text" value="application/json" readonly class="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
            </div>
            <div class="flex items-center gap-2">
              <input type="text" value="X-App-ID" readonly class="w-1/3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 dark:text-slate-600">:</span>
              <input type="text" :value="`app-${selectedAppId}`" readonly class="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
            </div>
          </div>

          <!-- Body JSON Content -->
          <div v-if="activeTab === 'body'" class="py-3">
            <textarea
              v-model="requestBody"
              rows="6"
              placeholder='{\n  "nip": "198001012005011001",\n  "nama": "Ahmad Budi S."\n}'
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-600 dark:text-blue-300 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Params Content -->
          <div v-if="activeTab === 'params'" class="py-3 space-y-2 font-mono text-xs">
            <div class="flex items-center gap-2">
              <input type="text" value="page" class="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
              <span class="text-slate-400 dark:text-slate-600">=</span>
              <input type="text" value="1" class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
            </div>
            <div class="flex items-center gap-2">
              <input type="text" value="per_page" class="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
              <span class="text-slate-400 dark:text-slate-600">=</span>
              <input type="text" value="15" class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-300">
            </div>
          </div>
        </div>
      </div>

      <!-- RESPONSE VIEWER PANEL -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl min-h-[420px] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📥</span> Response Payload
            </h3>

            <div v-if="responseResult" class="flex items-center gap-3 font-mono text-xs">
              <span :class="['px-2.5 py-0.5 rounded font-bold', responseResult.status === 200 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30']">
                {{ responseResult.status }} {{ responseResult.statusText }}
              </span>
              <span class="text-slate-500 dark:text-slate-400">{{ responseResult.time }}ms</span>
            </div>
          </div>

          <!-- Empty Placeholder -->
          <div v-if="!responseResult && !loading" class="py-20 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <div class="text-4xl">📭</div>
            <p class="text-xs">Klik <strong>Send</strong> untuk melakukan pengujian request API</p>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="py-20 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <div class="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs font-mono">Mengirim request ke API Gateway...</p>
          </div>

          <!-- JSON Response Payload Output -->
          <div v-if="responseResult && !loading" class="relative">
            <pre class="bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed max-h-[320px]"><code>{{ JSON.stringify(responseResult.data, null, 2) }}</code></pre>
          </div>
        </div>

        <div v-if="responseResult" class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[11px] text-slate-500">
          <span>Content-Type: application/json</span>
          <span>Size: {{ JSON.stringify(responseResult.data).length }} B</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const selectedAppId = ref(1)
const requestMethod = ref('GET')
const requestUrl = ref('/api/pegawai')
const activeTab = ref('headers')
const requestBody = ref('')
const loading = ref(false)
const responseResult = ref(null)

const currentApiKey = computed(() => {
  const k = store.apiKeys.find(key => key.appId === selectedAppId.value)
  return k ? k.key : '3f8c9e2a1b4d7e8f9a0b1c2d3e4f5a6b'
})

const handleAppSelect = () => {
  // auto selected
}

const sendRequest = () => {
  loading.value = true
  responseResult.value = null

  setTimeout(() => {
    loading.value = false
    const url = requestUrl.value.toLowerCase()

    if (url.includes('pegawai')) {
      responseResult.value = {
        status: 200,
        statusText: 'OK',
        time: 87,
        data: {
          success: true,
          message: 'Data pegawai ASN Kabupaten Lampung Utara berhasil diambil',
          data: [
            { id: 1, nip: '198001012005011001', nama: 'Ahmad Budi Santoso', jabatan: 'Analis Kepegawaian', opd: 'BKPSDM' },
            { id: 2, nip: '197505152000032002', nama: 'Siti Rahma Dewi', jabatan: 'Kepala Seksi', opd: 'Diskominfo' }
          ],
          meta: { total: 3821, page: 1, per_page: 15 }
        }
      }
    } else if (url.includes('opd')) {
      responseResult.value = {
        status: 200,
        statusText: 'OK',
        time: 55,
        data: {
          success: true,
          data: [
            { id: 1, nama: 'BKPSDM', kepala: 'Drs. H. Slamet' },
            { id: 2, nama: 'Diskominfo', kepala: 'H. Ahmad Rifa\'i' },
            { id: 3, nama: 'BPKAD', kepala: 'Drs. Hendra Jaya' }
          ]
        }
      }
    } else {
      responseResult.value = {
        status: 200,
        statusText: 'OK',
        time: 110,
        data: {
          success: true,
          message: `Request ${requestMethod.value} ke ${requestUrl.value} berhasil diproses oleh Gerbang API`,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Add to logs
    const app = store.applications.find(a => a.id === selectedAppId.value)
    store.requestLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      appName: app ? app.name : 'SIMPEG',
      method: requestMethod.value,
      url: requestUrl.value,
      statusCode: 200,
      responseTimeMs: responseResult.value.time,
      ipAddress: '127.0.0.1 (Tester)',
      aiAnalysis: null
    })
  }, 700)
}
</script>

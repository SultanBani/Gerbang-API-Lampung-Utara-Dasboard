<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
      <div class="flex flex-1 flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[240px]">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari URL endpoint atau deskripsi..."
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        <select v-model="filterMethod" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm">
          <option value="all">Semua Method</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select v-model="filterTag" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm">
          <option value="all">Semua Tag</option>
          <option value="Pegawai">Pegawai</option>
          <option value="Auth">Auth</option>
          <option value="OPD">OPD</option>
          <option value="Penduduk">Penduduk</option>
        </select>
      </div>

      <button
        @click="showAddModal = true"
        class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
      >
        <span>➕</span>
        <span>Tambah Endpoint API</span>
      </button>
    </div>

    <!-- Endpoints Table Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-5">#</th>
              <th class="py-3.5 px-5">Method</th>
              <th class="py-3.5 px-5">URL Endpoint</th>
              <th class="py-3.5 px-5">Deskripsi Fitur</th>
              <th class="py-3.5 px-5">Tag Group</th>
              <th class="py-3.5 px-5 text-center">Auth API Key</th>
              <th class="py-3.5 px-5 text-center">Rate Limit</th>
              <th class="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-for="(ep, index) in filteredEndpoints" :key="ep.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-4 px-5 text-slate-400 font-mono font-bold">{{ index + 1 }}</td>
              <td class="py-4 px-5">
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
              </td>
              <td class="py-4 px-5 font-mono text-slate-900 dark:text-slate-200 font-bold text-xs">
                <code>{{ ep.url }}</code>
              </td>
              <td class="py-4 px-5 text-slate-700 dark:text-slate-300 max-w-xs leading-relaxed">{{ ep.description }}</td>
              <td class="py-4 px-5">
                <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
                  {{ ep.tag }}
                </span>
              </td>
              <td class="py-4 px-5 text-center">
                <span :class="ep.isAuthRequired ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'">
                  {{ ep.isAuthRequired ? '✓ Wajib' : '✗ Publik' }}
                </span>
              </td>
              <td class="py-4 px-5 text-center font-mono text-slate-600 dark:text-slate-300">
                {{ ep.rateLimit }} req/mnt
              </td>
              <td class="py-4 px-5 text-right">
                <button
                  @click="deleteEndpoint(ep.id)"
                  class="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="filteredEndpoints.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                Tidak ada endpoint yang ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah Endpoint -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>⚙️</span> Registrasi Endpoint API Baru
          </h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="submitEndpoint" class="p-6 space-y-4">
          <!-- AI Recommendation Helper Box -->
          <div class="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div class="text-[11px] text-indigo-700 dark:text-indigo-300">
              <strong class="block font-bold">🤖 AI Endpoint Recommender</strong>
              <span class="text-slate-500 dark:text-slate-400">Ketik nama fitur lalu dapatkan rekomendasi otomatis URL & Method.</span>
            </div>
            <button
              type="button"
              @click="applyAiRecommendation"
              class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow"
            >
              ✨ Rekomendasi AI
            </button>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Method *</label>
              <select v-model="newForm.method" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">URL Endpoint *</label>
              <input
                v-model="newForm.url"
                required
                type="text"
                placeholder="/api/nama-fitur"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tag Group *</label>
              <input
                v-model="newForm.tag"
                required
                type="text"
                placeholder="Contoh: Pegawai / Auth"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Rate Limit (req/mnt) *</label>
              <input
                v-model.number="newForm.rateLimit"
                required
                type="number"
                placeholder="60"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi Fitur</label>
            <textarea
              v-model="newForm.description"
              rows="3"
              placeholder="Deskripsikan fungsi endpoint ini secara jelas..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="newForm.isAuthRequired" type="checkbox" id="authReq" class="rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-0">
            <label for="authReq" class="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Wajib Menggunakan API Key / Token Authentication</label>
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-colors"
            >
              Daftarkan Endpoint
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const searchQuery = ref('')
const filterMethod = ref('all')
const filterTag = ref('all')
const showAddModal = ref(false)

const newForm = ref({
  method: 'GET',
  url: '',
  description: '',
  tag: '',
  isAuthRequired: true,
  rateLimit: 60
})

const filteredEndpoints = computed(() => {
  return store.endpoints.filter(ep => {
    const matchQuery =
      ep.url.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchMethod = filterMethod.value === 'all' || ep.method === filterMethod.value
    const matchTag = filterTag.value === 'all' || ep.tag === filterTag.value

    return matchQuery && matchMethod && matchTag
  })
})

const applyAiRecommendation = () => {
  newForm.value = {
    method: 'GET',
    url: '/api/penduduk/nik',
    description: 'Ambil data kependudukan berdasarkan NIK secara real-time dari SIAK',
    tag: 'Penduduk',
    isAuthRequired: true,
    rateLimit: 50
  }
}

const submitEndpoint = () => {
  store.addEndpoint({ ...newForm.value })
  showAddModal.value = false
  newForm.value = { method: 'GET', url: '', description: '', tag: '', isAuthRequired: true, rateLimit: 60 }
}

const deleteEndpoint = (id) => {
  if (confirm('Hapus registrasi endpoint ini?')) {
    store.deleteEndpoint(id)
  }
}
</script>

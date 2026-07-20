<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
      <!-- Search & Filters -->
      <div class="flex flex-1 flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[240px]">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama aplikasi, OPD, atau PIC..."
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>

        <select v-model="filterStatus" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm">
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>

        <select v-model="filterOpd" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-sm">
          <option value="all">Semua OPD</option>
          <option value="BKPSDM">BKPSDM</option>
          <option value="Diskominfo">Diskominfo</option>
          <option value="Disdukcapil">Disdukcapil</option>
          <option value="BPKAD">BPKAD</option>
          <option value="Dinas Pendidikan">Dinas Pendidikan</option>
        </select>
      </div>

      <!-- Add App Button -->
      <button
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
      >
        <span>➕</span>
        <span>Tambah Aplikasi Baru</span>
      </button>
    </div>

    <!-- Applications Table Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-5">#</th>
              <th class="py-3.5 px-5">Nama Aplikasi</th>
              <th class="py-3.5 px-5">OPD / Instansi</th>
              <th class="py-3.5 px-5">PIC / Kontak</th>
              <th class="py-3.5 px-5 text-center">Status</th>
              <th class="py-3.5 px-5">Tanggal Didaftarkan</th>
              <th class="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-for="(app, index) in filteredApps" :key="app.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-4 px-5 text-slate-400 font-mono font-bold">{{ index + 1 }}</td>
              <td class="py-4 px-5">
                <div class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{{ app.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ app.fullName }}</div>
              </td>
              <td class="py-4 px-5">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700/60">
                  {{ app.opd }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="font-semibold text-slate-800 dark:text-slate-200">{{ app.pic }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{{ app.phone }}</div>
              </td>
              <td class="py-4 px-5 text-center">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5',
                    app.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', app.status === 'active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400']"></span>
                  <span>{{ app.status === 'active' ? 'Aktif' : 'Nonaktif' }}</span>
                </span>
              </td>
              <td class="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{{ app.createdAt }}</td>
              <td class="py-4 px-5 text-right space-x-2">
                <button
                  @click="deleteApp(app.id)"
                  class="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="filteredApps.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400">
                Tidak ada aplikasi yang sesuai dengan pencarian atau filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah Aplikasi -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🗂️</span> Tambah Aplikasi OPD Baru
          </h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="submitApp" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama Singkat Aplikasi *</label>
              <input
                v-model="newForm.name"
                required
                type="text"
                placeholder="Contoh: SIMPEG"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">OPD / Pengelola *</label>
              <input
                v-model="newForm.opd"
                required
                type="text"
                placeholder="Contoh: BKPSDM"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama Lengkap Sistem</label>
            <input
              v-model="newForm.fullName"
              type="text"
              placeholder="Contoh: Sistem Informasi Kepegawaian Daerah"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nama PIC *</label>
              <input
                v-model="newForm.pic"
                required
                type="text"
                placeholder="Contoh: Budi Santoso"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Nomor WhatsApp/Kontak</label>
              <input
                v-model="newForm.phone"
                type="text"
                placeholder="0812-xxxx-xxxx"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi Aplikasi</label>
            <textarea
              v-model="newForm.description"
              rows="3"
              placeholder="Jelaskan fungsi integrasi aplikasi ini..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            ></textarea>
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
              class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-colors"
            >
              Simpan Aplikasi
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
const filterStatus = ref('all')
const filterOpd = ref('all')
const showAddModal = ref(false)

const newForm = ref({
  name: '',
  fullName: '',
  opd: '',
  pic: '',
  phone: '',
  description: '',
  status: 'active'
})

const filteredApps = computed(() => {
  return store.applications.filter(app => {
    const matchQuery =
      app.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      app.opd.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      app.pic.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchStatus = filterStatus.value === 'all' || app.status === filterStatus.value
    const matchOpd = filterOpd.value === 'all' || app.opd === filterOpd.value

    return matchQuery && matchStatus && matchOpd
  })
})

const submitApp = () => {
  store.addApplication({ ...newForm.value })
  showAddModal.value = false
  newForm.value = { name: '', fullName: '', opd: '', pic: '', phone: '', description: '', status: 'active' }
}

const deleteApp = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus aplikasi ini dari daftar?')) {
    store.deleteApplication(id)
  }
}
</script>

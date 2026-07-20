<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md dark:shadow-xl text-white">
      <div>
        <h3 class="font-extrabold text-base flex items-center gap-2">
          <span>🗝️</span> Manajemen Token & API Key Aplikasi
        </h3>
        <p class="text-xs text-slate-300 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Setiap aplikasi OPD menggunakan API Key unik di Header <code class="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 font-mono">Authorization: Bearer {API_KEY}</code> untuk mengautentikasi request ke Gerbang API.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
          ✓ {{ activeCount }} API Key Aktif
        </span>
      </div>
    </div>

    <!-- API Key Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="keyObj in store.apiKeys"
        :key="keyObj.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-lg relative"
      >
        <!-- App Title & Status -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <span>{{ keyObj.appName }}</span>
              <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {{ keyObj.opd }}
              </span>
            </div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Terakhir digunakan: {{ keyObj.lastUsedAt }}</span>
          </div>

          <span
            :class="[
              'px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1',
              keyObj.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : '',
              keyObj.status === 'expired' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' : '',
              keyObj.status === 'revoked' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' : ''
            ]"
          >
            ● {{ keyObj.status.toUpperCase() }}
          </span>
        </div>

        <!-- Key Display Box -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">API Bearer Token Key</label>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-blue-400 dark:text-blue-300 font-bold tracking-wider overflow-x-auto select-all">
              🔒 {{ visibleKeys[keyObj.id] ? keyObj.key : maskKey(keyObj.key) }}
            </div>
            <button
              @click="toggleVisibility(keyObj.id)"
              class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
              title="Lihat/Sembunyikan Key"
            >
              {{ visibleKeys[keyObj.id] ? '🙈' : '👁️' }}
            </button>
            <button
              @click="copyToClipboard(keyObj.key)"
              class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow"
              title="Salin Key ke Clipboard"
            >
              📋
            </button>
          </div>
        </div>

        <!-- Dates & Expiry Info -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span>Kedaluwarsa: <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ keyObj.expiresAt }}</strong></span>
          <span class="text-slate-400 dark:text-slate-500">256-bit Enkripsi</span>
        </div>

        <!-- Card Actions -->
        <div class="pt-2 flex flex-wrap gap-2">
          <button
            @click="generateNewKey(keyObj.appId)"
            class="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🔄</span> Generate Baru
          </button>
          <button
            @click="revokeKey(keyObj.appId)"
            :disabled="keyObj.status === 'revoked'"
            class="bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-600 dark:text-red-400 border border-red-500/30 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
          >
            🚫 Revoke
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="toastMessage" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2">
        <span>✅</span> {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/apiGatewayStore.js'

const visibleKeys = ref({})
const toastMessage = ref('')

const activeCount = computed(() => {
  return store.apiKeys.filter(k => k.status === 'active').length
})

const maskKey = (key) => {
  if (!key) return ''
  return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4)
}

const toggleVisibility = (id) => {
  visibleKeys.value[id] = !visibleKeys.value[id]
}

const copyToClipboard = (key) => {
  navigator.clipboard.writeText(key)
  toastMessage.value = 'API Key berhasil disalin ke clipboard!'
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

const generateNewKey = (appId) => {
  if (confirm('Generate API Key baru untuk aplikasi ini? Key lama akan hangus.')) {
    store.generateNewKey(appId)
    toastMessage.value = 'API Key baru berhasil di-generate!'
    setTimeout(() => { toastMessage.value = '' }, 2500)
  }
}

const revokeKey = (appId) => {
  if (confirm('Apakah Anda yakin ingin melakukan Revoke pada API Key ini? Aplikasi tidak akan bisa mengakses API lagi.')) {
    store.revokeKey(appId)
    toastMessage.value = 'API Key berhasil di-revoke.'
    setTimeout(() => { toastMessage.value = '' }, 2500)
  }
}
</script>

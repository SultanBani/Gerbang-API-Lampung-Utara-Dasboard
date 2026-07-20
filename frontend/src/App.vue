<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content Layout -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top Header -->
      <Header />

      <!-- Main Page Content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <router-view v-slot="{ Component }">
          <transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- AI Chatbot Assistant Floating Widget -->
    <AiChatWidget />
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import AiChatWidget from './components/AiChatWidget.vue'
</script>

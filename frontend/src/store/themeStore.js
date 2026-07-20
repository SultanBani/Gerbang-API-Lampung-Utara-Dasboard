import { ref, watchEffect } from 'vue'

const savedTheme = localStorage.getItem('theme')
export const isDark = ref(savedTheme ? savedTheme === 'dark' : true)

export function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

watchEffect(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

import { ref, watch } from 'vue'

const savedTheme = localStorage.getItem('theme')
export const isDark = ref(savedTheme ? savedTheme === 'dark' : true)

export function applyTheme(val) {
  if (val) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
  }
}

export function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme(isDark.value)
}

// Initial application
applyTheme(isDark.value)

watch(isDark, (newVal) => {
  applyTheme(newVal)
})

<script setup lang="ts">
import { navigation } from '~/content/site'
const open = ref(false)
const isLight = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const mobileMenu = ref<HTMLElement | null>(null)

const applyTheme = () => {
  const theme = isLight.value ? 'light' : 'dark'
  document.documentElement.classList.toggle('light', isLight.value)
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight.value ? '#f7f8fc' : '#0b0b10')
  window.localStorage.setItem('theme', theme)
  window.dispatchEvent(new CustomEvent('site-theme-change', { detail: { theme } }))
}

const toggleTheme = () => {
  isLight.value = !isLight.value
  applyTheme()
}

const close = () => {
  open.value = false
  nextTick(() => menuButton.value?.focus())
}

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    mobileMenu.value?.querySelector<HTMLElement>('a')?.focus()
  }
})

onMounted(() => {
  isLight.value = document.documentElement.classList.contains('light')
})
</script>

<template>
  <header class="site-header sticky top-0 z-30">
    <nav class="site-nav section-shell" aria-label="Main navigation">
      <SiteLogo />
      <div class="site-nav__links">
        <a v-for="item in navigation" :key="item.href" :href="item.href" class="text-sm text-paper/75 transition hover:text-paper">{{ item.label }}</a>
      </div>
      <div class="site-nav__actions">
        <a href="#contact" class="header-cta">Let’s Talk</a>
        <button class="theme-toggle" type="button" :aria-label="isLight ? 'Switch to dark mode' : 'Switch to light mode'" :aria-pressed="isLight" @click="toggleTheme">
          <svg v-if="isLight" aria-hidden="true" viewBox="0 0 24 24"><path d="M20.7 15.4A8 8 0 0 1 8.6 3.3 8.6 8.6 0 1 0 20.7 15.4Z" /></svg>
          <svg v-else aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></svg>
        </button>
        <button ref="menuButton" class="menu-toggle" type="button" :aria-expanded="open" aria-controls="mobile-nav" @click="open = !open">
          <span class="sr-only">{{ open ? 'Close' : 'Open' }} navigation</span><span aria-hidden="true">{{ open ? '×' : 'Menu' }}</span>
        </button>
      </div>
    </nav>
    <div v-if="open" id="mobile-nav" ref="mobileMenu" class="mobile-nav" @keydown.esc="close">
      <div class="section-shell grid gap-1">
        <a v-for="item in navigation" :key="item.href" :href="item.href" class="rounded-md px-3 py-3 text-lg hover:bg-white/5" @click="close">{{ item.label }}</a>
        <a href="#contact" class="header-cta mt-2" @click="close">Let’s Talk</a>
      </div>
    </div>
  </header>
</template>

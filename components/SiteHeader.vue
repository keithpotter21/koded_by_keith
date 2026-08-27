<script setup lang="ts">
import { navigation } from '~/content/site'
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const mobileMenu = ref<HTMLElement | null>(null)

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
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
    <nav class="section-shell flex min-h-18 items-center justify-between py-4" aria-label="Main navigation">
      <SiteLogo />
      <div class="hidden items-center gap-7 md:flex">
        <a v-for="item in navigation" :key="item.href" :href="item.href" class="text-sm text-paper/75 transition hover:text-paper">{{ item.label }}</a>
        <a href="#contact" class="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cyan">Start a Project</a>
      </div>
      <button ref="menuButton" class="min-h-11 min-w-11 rounded-md border border-white/15 text-sm md:hidden" type="button" :aria-expanded="open" aria-controls="mobile-nav" @click="open = !open">
        <span class="sr-only">{{ open ? 'Close' : 'Open' }} navigation</span><span aria-hidden="true">{{ open ? '×' : 'Menu' }}</span>
      </button>
    </nav>
    <div v-if="open" id="mobile-nav" ref="mobileMenu" class="border-t border-white/10 bg-surface px-4 py-5 md:hidden" @keydown.esc="close">
      <div class="section-shell grid gap-1">
        <a v-for="item in navigation" :key="item.href" :href="item.href" class="rounded-md px-3 py-3 text-lg hover:bg-white/5" @click="close">{{ item.label }}</a>
        <a href="#contact" class="mt-2 rounded-full bg-paper px-4 py-3 text-center font-semibold text-ink" @click="close">Start a Project</a>
      </div>
    </div>
  </header>
</template>

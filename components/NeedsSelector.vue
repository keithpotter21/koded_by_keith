<script setup lang="ts">
import { needs } from '~/content/site'
const selected = ref(needs[0])
const emit = defineEmits<{ select: [interest: string] }>()
function selectNeed(id: string) { selected.value = needs.find((need) => need.id === id) ?? needs[0]; emit('select', selected.value.interest) }
function continueToContact() { emit('select', selected.value.interest); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }
function selectAndFocus(index: number, event: KeyboardEvent) {
  event.preventDefault()
  selectNeed(needs[index].id)
  nextTick(() => document.querySelector<HTMLButtonElement>(`#${needs[index].id}-tab`)?.focus())
}
function moveSelection(currentIndex: number, direction: 1 | -1, event: KeyboardEvent) {
  selectAndFocus((currentIndex + direction + needs.length) % needs.length, event)
}
</script>

<template>
  <section id="needs" class="border-y border-white/10 bg-surface py-20 sm:py-28" aria-labelledby="needs-heading">
    <div class="section-shell">
      <p class="eyebrow">A useful place to start</p>
      <h2 id="needs-heading" class="mt-4 text-4xl font-semibold tracking-[-.06em] sm:text-6xl">What do you need?</h2>
      <p class="mt-3 text-lg text-muted">Pick the one that sounds most like you.</p>
      <div class="mt-10 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <div role="tablist" aria-label="Project needs" class="grid content-start gap-2">
          <button v-for="(need, index) in needs" :id="`${need.id}-tab`" :key="need.id" type="button" role="tab" :tabindex="selected.id === need.id ? 0 : -1" :aria-selected="selected.id === need.id" :aria-controls="`${need.id}-panel`" class="group flex min-h-16 items-center justify-between border-b border-white/10 px-1 py-4 text-left transition hover:border-cyan" :class="selected.id === need.id ? 'text-paper' : 'text-muted'" @click="selectNeed(need.id)" @keydown.right="moveSelection(index, 1, $event)" @keydown.left="moveSelection(index, -1, $event)" @keydown.down="moveSelection(index, 1, $event)" @keydown.up="moveSelection(index, -1, $event)" @keydown.home="selectAndFocus(0, $event)" @keydown.end="selectAndFocus(needs.length - 1, $event)">
            <span><span class="block text-lg font-medium">{{ need.label }}</span><span class="mt-1 block text-sm">{{ need.kicker }}</span></span><span aria-hidden="true" class="text-xl transition group-hover:translate-x-1">→</span>
          </button>
        </div>
        <div :id="`${selected.id}-panel`" role="tabpanel" :aria-labelledby="`${selected.id}-tab`" class="relative overflow-hidden border border-white/10 bg-elevated p-7 sm:p-10">
          <div class="absolute inset-x-0 top-0 h-px gradient-line" />
          <p class="eyebrow gradient-text">{{ selected.kicker }}</p>
          <h3 class="mt-5 max-w-xl text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{{ selected.title }}</h3>
          <p class="mt-5 max-w-xl text-lg leading-8 text-muted">{{ selected.body }}</p>
          <ul class="mt-8 grid gap-3 sm:grid-cols-2" aria-label="What this can include"><li v-for="feature in selected.features" :key="feature" class="flex gap-3 text-sm"><span class="text-cyan" aria-hidden="true">✦</span>{{ feature }}</li></ul>
          <button type="button" class="mt-10 inline-flex items-center gap-3 font-semibold text-cyan hover:text-paper" @click="continueToContact">Tell me about your project <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </div>
  </section>
</template>

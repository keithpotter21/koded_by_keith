<script setup lang="ts">
import { privacy } from '~/content/privacy'
import { site } from '~/content/site'
useHead({ title: `Privacy | ${site.name}`, meta: [{ name: 'description', content: 'Privacy policy for Koded by Keith.' }] })
</script>
<template><div><a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a><SiteHeader /><main id="main-content" class="section-shell py-20 sm:py-28"><p class="eyebrow">{{ privacy.updated }}</p><h1 class="mt-4 text-5xl font-semibold tracking-[-.06em] sm:text-7xl">{{ privacy.title }}</h1><p class="mt-6 max-w-2xl text-lg leading-8 text-muted">A plain-language overview of how contact information is handled.</p><div class="mt-14 max-w-3xl divide-y divide-white/10 border-t border-white/10"><section v-for="section in privacy.sections" :key="section.heading" class="py-7"><h2 class="text-xl font-semibold">{{ section.heading }}</h2><p class="mt-3 leading-8 text-muted">{{ section.body }}</p></section></div></main></div></template>

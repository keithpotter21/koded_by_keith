export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      // Keep the design system in the initial stylesheet so history navigation
      // cannot briefly render an unstyled route while its CSS chunk resolves.
      cssCodeSplit: false,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'theme-color', content: '#0b0b10' }],
      script: [{
        innerHTML: `(function(){try{var saved=localStorage.getItem('theme');var light=saved?saved==='light':matchMedia('(prefers-color-scheme: light)').matches;document.documentElement.classList.toggle('light',light);document.documentElement.style.colorScheme=light?'light':'dark'}catch(e){}})()`,
      }],
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://keithpotter.net',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    },
  },
  typescript: { strict: true },
  compatibilityDate: '2026-08-27',
})

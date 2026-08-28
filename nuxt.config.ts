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
    },
  },
  runtimeConfig: {
    googleFormEndpoint: process.env.GOOGLE_FORM_ENDPOINT,
    emailFrom: process.env.EMAIL_FROM,
    contactNotificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL,
    contactRateLimit: process.env.CONTACT_RATE_LIMIT || '5',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://keithpotter.net',
    },
  },
  typescript: { strict: true },
  compatibilityDate: '2026-08-27',
})

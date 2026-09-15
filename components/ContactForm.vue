<script setup lang="ts">
interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const props = defineProps<{ interest: string }>()
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const turnstileSiteKey = String(runtimeConfig.public.turnstileSiteKey || '')
const contactEndpoint = import.meta.dev ? '/api/contact' : '/.netlify/functions/contact'
const contactTokenEndpoint = import.meta.dev ? '/api/contact-token' : '/.netlify/functions/contact-token'
const fields = reactive({ name: '', business: '', email: '', phone: '', website: '', interest: props.interest, message: '', company: '' })
const errors = reactive<Record<string, string>>({})
const formToken = ref('')
const formReady = ref(false)
const turnstileToken = ref('')
const spamProtectionError = ref('')
const turnstileContainer = ref<HTMLElement | null>(null)
let turnstileWidgetId = ''
let readinessTimer: ReturnType<typeof setTimeout> | undefined

useHead({
  script: [{
    key: 'cloudflare-turnstile',
    src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    async: true,
    defer: true,
  }],
})

watch(() => props.interest, (value) => { fields.interest = value })

async function refreshFormToken() {
  formReady.value = false
  formToken.value = ''
  if (readinessTimer) clearTimeout(readinessTimer)
  try {
    const result = await $fetch<{ token: string; readyAt: number }>(contactTokenEndpoint)
    formToken.value = result.token
    const wait = Math.max(0, result.readyAt - Date.now())
    readinessTimer = setTimeout(() => { formReady.value = true }, wait)
  } catch {
    spamProtectionError.value = 'Spam protection could not load. Please refresh the page.'
  }
}

async function renderTurnstile() {
  if (!turnstileSiteKey) {
    spamProtectionError.value = 'Spam protection is not configured.'
    return
  }
  for (let attempt = 0; attempt < 100 && !window.turnstile; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  if (!window.turnstile || !turnstileContainer.value) {
    spamProtectionError.value = 'Spam protection could not load. Please refresh the page.'
    return
  }

  turnstileWidgetId = window.turnstile.render(turnstileContainer.value, {
    sitekey: turnstileSiteKey,
    action: 'contact',
    theme: 'dark',
    callback: (token: string) => {
      turnstileToken.value = token
      spamProtectionError.value = ''
    },
    'expired-callback': () => { turnstileToken.value = '' },
    'error-callback': () => {
      turnstileToken.value = ''
      spamProtectionError.value = 'Spam protection could not verify you. Please try again.'
    },
  })
}

async function resetSpamProtection() {
  turnstileToken.value = ''
  if (turnstileWidgetId && window.turnstile) window.turnstile.reset(turnstileWidgetId)
  await refreshFormToken()
}

onMounted(async () => {
  await Promise.all([refreshFormToken(), renderTurnstile()])
})

onBeforeUnmount(() => {
  if (readinessTimer) clearTimeout(readinessTimer)
  if (turnstileWidgetId && window.turnstile) window.turnstile.remove(turnstileWidgetId)
})

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!fields.name.trim()) errors.name = 'Enter your name.'
  if (!fields.business.trim()) errors.business = 'Enter your business name.'
  if (!fields.email.trim()) errors.email = 'Enter your email address.'
  else if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = 'Enter a valid email address.'
  if (!fields.phone.trim()) errors.phone = 'Enter a phone number.'
  if (!fields.website.trim()) errors.website = 'Enter your current website.'
  else if (!/^https?:\/\/\S+$/i.test(fields.website)) errors.website = 'Enter a full website address beginning with https://.'
  if (!fields.interest) errors.interest = 'Choose what you are interested in.'
  if (!fields.message.trim()) errors.message = 'Tell me a little about your business.'
  return Object.keys(errors).length === 0
}
function trackingValue(name: string) {
  const value = route.query[name]
  return typeof value === 'string' ? value : ''
}
async function submit() {
  submitError.value = ''
  if (fields.company || !validate()) return
  if (!formReady.value || !formToken.value || !turnstileToken.value) {
    submitError.value = spamProtectionError.value || 'Please wait for spam protection to finish checking this form.'
    return
  }
  submitting.value = true
  try {
    await $fetch(contactEndpoint, {
      method: 'POST',
      body: {
        ...fields,
        sourcePage: route.fullPath,
        utmSource: trackingValue('utm_source'),
        utmMedium: trackingValue('utm_medium'),
        utmCampaign: trackingValue('utm_campaign'),
        formToken: formToken.value,
        turnstileToken: turnstileToken.value,
      },
    })
    submitted.value = true
  } catch (error: unknown) {
    const response = error as { data?: { data?: { errors?: Record<string, string> }; statusMessage?: string } }
    Object.assign(errors, response.data?.data?.errors || {})
    submitError.value = response.data?.statusMessage || 'Your message could not be sent. Please try again or email hello@keithpotter.net.'
    await resetSpamProtection()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form v-if="!submitted" class="relative grid gap-5" novalidate @submit.prevent="submit">
    <p class="text-sm text-muted">All fields are required.</p>
    <div v-if="Object.keys(errors).length" class="border-l-2 border-magenta bg-white/5 p-4" role="alert" tabindex="-1"><p class="font-semibold">Please fix the following:</p><ul class="mt-2 list-disc pl-5 text-sm text-paper/80"><li v-for="(error, field) in errors" :key="field">{{ error }}</li></ul></div>
    <p v-if="submitError" class="border-l-2 border-magenta bg-white/5 p-4 text-sm" role="alert">{{ submitError }}</p>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm font-medium"><span>Name <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.name" required autocomplete="name" :aria-invalid="Boolean(errors.name)" aria-describedby="name-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.name" id="name-error" class="text-sm text-pink-300">{{ errors.name }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Business name <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.business" required autocomplete="organization" :aria-invalid="Boolean(errors.business)" aria-describedby="business-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.business" id="business-error" class="text-sm text-pink-300">{{ errors.business }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Email <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.email" required type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)" aria-describedby="email-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.email" id="email-error" class="text-sm text-pink-300">{{ errors.email }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Phone <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.phone" required type="tel" autocomplete="tel" :aria-invalid="Boolean(errors.phone)" aria-describedby="phone-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.phone" id="phone-error" class="text-sm text-pink-300">{{ errors.phone }}</span></label>
    </div>
    <label class="grid gap-2 text-sm font-medium"><span>Current website <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.website" required type="url" inputmode="url" placeholder="https://" :aria-invalid="Boolean(errors.website)" aria-describedby="website-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper placeholder:text-muted" /><span v-if="errors.website" id="website-error" class="text-sm text-pink-300">{{ errors.website }}</span></label>
    <label class="grid gap-2 text-sm font-medium"><span>I’m interested in <span class="text-magenta" aria-hidden="true">*</span></span><select v-model="fields.interest" required :aria-invalid="Boolean(errors.interest)" aria-describedby="interest-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper"><option>New Website</option><option>Website Redesign / Improvements</option><option>SEO + AI Visibility</option><option>Google Business Profile</option><option>Website Care</option><option>Accessibility Audit</option><option>Accessibility Remediation</option><option>Something Else</option></select><span v-if="errors.interest" id="interest-error" class="text-sm text-pink-300">{{ errors.interest }}</span></label>
    <label class="grid gap-2 text-sm font-medium"><span>Tell me about your business <span class="text-magenta" aria-hidden="true">*</span></span><textarea v-model="fields.message" required rows="5" :aria-invalid="Boolean(errors.message)" aria-describedby="message-error" class="border border-white/15 bg-ink p-3 text-paper" /><span v-if="errors.message" id="message-error" class="text-sm text-pink-300">{{ errors.message }}</span></label>
    <div class="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><label>Leave this field empty<input v-model="fields.company" name="company_url" tabindex="-1" autocomplete="off" /></label></div>
    <div class="grid gap-2">
      <div ref="turnstileContainer" />
      <p v-if="spamProtectionError" class="text-sm text-pink-300" role="alert">{{ spamProtectionError }}</p>
      <p v-else-if="!formReady || !turnstileToken" class="text-sm text-muted" aria-live="polite">Checking spam protection…</p>
    </div>
    <button class="site-form-button justify-self-start disabled:cursor-wait disabled:opacity-70" type="submit" :disabled="submitting || !formReady || !turnstileToken" :aria-busy="submitting">{{ submitting ? 'Sending…' : 'Send Message' }} <span v-if="!submitting" aria-hidden="true">→</span></button>
  </form>
  <div v-else class="border border-cyan/40 bg-cyan/10 p-8" role="status"><p class="text-xl font-semibold">Thanks—your message is on its way.</p><p class="mt-3 text-muted">I’ll get back to you personally as soon as I can.</p></div>
</template>

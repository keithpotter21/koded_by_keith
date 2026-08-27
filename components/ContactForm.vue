<script setup lang="ts">
const props = defineProps<{ interest: string }>()
const submitted = ref(false)
const fields = reactive({ name: '', business: '', email: '', phone: '', website: '', interest: props.interest, message: '', company: '' })
const errors = reactive<Record<string, string>>({})
watch(() => props.interest, (value) => { fields.interest = value })
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
function submit() { if (fields.company || !validate()) return; submitted.value = true }
</script>

<template>
  <form v-if="!submitted" class="grid gap-5" novalidate @submit.prevent="submit">
    <p class="text-sm text-muted">All fields are required. Form delivery will be connected in Phase 3.</p>
    <div v-if="Object.keys(errors).length" class="border-l-2 border-magenta bg-white/5 p-4" role="alert" tabindex="-1"><p class="font-semibold">Please fix the following:</p><ul class="mt-2 list-disc pl-5 text-sm text-paper/80"><li v-for="(error, field) in errors" :key="field">{{ error }}</li></ul></div>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm font-medium"><span>Name <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.name" required autocomplete="name" :aria-invalid="Boolean(errors.name)" aria-describedby="name-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.name" id="name-error" class="text-sm text-pink-300">{{ errors.name }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Business name <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.business" required autocomplete="organization" :aria-invalid="Boolean(errors.business)" aria-describedby="business-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.business" id="business-error" class="text-sm text-pink-300">{{ errors.business }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Email <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.email" required type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)" aria-describedby="email-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.email" id="email-error" class="text-sm text-pink-300">{{ errors.email }}</span></label>
      <label class="grid gap-2 text-sm font-medium"><span>Phone <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.phone" required type="tel" autocomplete="tel" :aria-invalid="Boolean(errors.phone)" aria-describedby="phone-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper" /><span v-if="errors.phone" id="phone-error" class="text-sm text-pink-300">{{ errors.phone }}</span></label>
    </div>
    <label class="grid gap-2 text-sm font-medium"><span>Current website <span class="text-magenta" aria-hidden="true">*</span></span><input v-model="fields.website" required type="url" inputmode="url" placeholder="https://" :aria-invalid="Boolean(errors.website)" aria-describedby="website-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper placeholder:text-muted" /><span v-if="errors.website" id="website-error" class="text-sm text-pink-300">{{ errors.website }}</span></label>
    <label class="grid gap-2 text-sm font-medium"><span>I’m interested in <span class="text-magenta" aria-hidden="true">*</span></span><select v-model="fields.interest" required :aria-invalid="Boolean(errors.interest)" aria-describedby="interest-error" class="min-h-12 border border-white/15 bg-ink px-3 text-paper"><option>New Website</option><option>Website Redesign / Improvements</option><option>SEO + AI Visibility</option><option>Google Business Profile</option><option>Website Care</option><option>Accessibility Audit</option><option>Accessibility Remediation</option><option>Something Else</option></select><span v-if="errors.interest" id="interest-error" class="text-sm text-pink-300">{{ errors.interest }}</span></label>
    <label class="grid gap-2 text-sm font-medium"><span>Tell me about your business <span class="text-magenta" aria-hidden="true">*</span></span><textarea v-model="fields.message" required rows="5" :aria-invalid="Boolean(errors.message)" aria-describedby="message-error" class="border border-white/15 bg-ink p-3 text-paper" /><span v-if="errors.message" id="message-error" class="text-sm text-pink-300">{{ errors.message }}</span></label>
    <div class="hidden" aria-hidden="true"><label>Company<input v-model="fields.company" tabindex="-1" autocomplete="off" /></label></div>
    <button class="justify-self-start rounded-full bg-paper px-6 py-3 font-semibold text-ink transition hover:bg-cyan" type="submit">Send Message <span aria-hidden="true">→</span></button>
  </form>
  <div v-else class="border border-cyan/40 bg-cyan/10 p-8" role="status"><p class="text-xl font-semibold">Thanks—your message is ready to send.</p><p class="mt-3 text-muted">This Phase 1 prototype does not deliver form messages yet. The finished experience will confirm a successful submission here.</p></div>
</template>

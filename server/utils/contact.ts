import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getStore } from '@netlify/blobs'

export const contactInterests = [
  'New Website',
  'Website Redesign / Improvements',
  'SEO + AI Visibility',
  'Google Business Profile',
  'Website Care',
  'Accessibility Audit',
  'Accessibility Remediation',
  'Something Else',
] as const

export type ContactInterest = (typeof contactInterests)[number]

export interface ContactSubmission {
  name: string
  business: string
  email: string
  phone: string
  website: string
  interest: ContactInterest
  message: string
  sourcePage: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  userAgent?: string
}

export type ContactInput = Partial<ContactSubmission> & {
  company?: string
  formToken?: string
  turnstileToken?: string
}

export interface ContactEnvironment {
  googleFormEndpoint?: string
  googleFormSecret?: string
  resendApiKey?: string
  emailFrom?: string
  notificationEmail?: string
  turnstileSecretKey?: string
  formSigningSecret?: string
  turnstileAllowedHostnames?: string
  minimumFormAgeSeconds?: number
  maximumFormAgeSeconds?: number
  duplicateWindowSeconds?: number
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function getContactEnvironmentFromProcess(): ContactEnvironment {
  return {
    googleFormEndpoint: process.env.GOOGLE_FORM_ENDPOINT,
    googleFormSecret: process.env.GOOGLE_FORM_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    notificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    formSigningSecret: process.env.CONTACT_FORM_SIGNING_SECRET,
    turnstileAllowedHostnames: process.env.TURNSTILE_ALLOWED_HOSTNAMES,
    minimumFormAgeSeconds: positiveNumber(process.env.CONTACT_FORM_MIN_SECONDS, 3),
    maximumFormAgeSeconds: positiveNumber(process.env.CONTACT_FORM_MAX_SECONDS, 1800),
    duplicateWindowSeconds: positiveNumber(process.env.CONTACT_DUPLICATE_WINDOW_SECONDS, 900),
  }
}

export class ContactRequestError extends Error {
  constructor(
    public statusCode: number,
    public publicMessage: string,
    public errors?: Record<string, string>,
  ) {
    super(publicMessage)
  }
}

const emailPattern = /^\S+@\S+\.\S+$/
const websitePattern = /^https:\/\/\S+$/i
const timingTokenPattern = /^(\d{13})\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength) : ''
}

export function validateContact(input: ContactInput): { data?: ContactSubmission; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const name = clean(input.name, 120)
  const business = clean(input.business, 160)
  const email = clean(input.email, 254)
  const phone = clean(input.phone, 40)
  const website = clean(input.website, 500)
  const interest = clean(input.interest, 80) as ContactInterest
  const message = clean(input.message, 5000)

  if (!name) errors.name = 'Enter your name.'
  if (!business) errors.business = 'Enter your business name.'
  if (!email) errors.email = 'Enter your email address.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
  if (!phone) errors.phone = 'Enter a phone number.'
  if (!website) errors.website = 'Enter your current website.'
  else if (!websitePattern.test(website)) errors.website = 'Enter a full website address beginning with https://.'
  if (!contactInterests.includes(interest)) errors.interest = 'Choose what you are interested in.'
  if (!message) errors.message = 'Tell me a little about your business.'

  if (Object.keys(errors).length) return { errors }

  return {
    errors,
    data: {
      name, business, email, phone, website, interest, message,
      sourcePage: clean(input.sourcePage, 500) || '/',
      utmSource: clean(input.utmSource, 200) || undefined,
      utmMedium: clean(input.utmMedium, 200) || undefined,
      utmCampaign: clean(input.utmCampaign, 200) || undefined,
      userAgent: clean(input.userAgent, 500) || undefined,
    },
  }
}

const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(clientAddress: string, limit: number) {
  const now = Date.now()
  const existing = requestCounts.get(clientAddress)
  if (!existing || existing.resetAt < now) {
    requestCounts.set(clientAddress, { count: 1, resetAt: now + 60_000 })
    return false
  }
  existing.count += 1
  return existing.count > limit
}

function timingSignature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createFormTimingToken(secret: string, minimumAgeSeconds = 3) {
  const issuedAt = Date.now()
  const payload = `${issuedAt}.${randomBytes(16).toString('base64url')}`
  return {
    token: `${payload}.${timingSignature(payload, secret)}`,
    readyAt: issuedAt + minimumAgeSeconds * 1000,
  }
}

export function verifyFormTimingToken(
  token: unknown,
  secret: string,
  minimumAgeSeconds = 3,
  maximumAgeSeconds = 1800,
) {
  if (typeof token !== 'string') return false
  const match = token.match(timingTokenPattern)
  if (!match) return false

  const [, issuedAtValue, nonce, suppliedSignature] = match
  const payload = `${issuedAtValue}.${nonce}`
  const expectedSignature = timingSignature(payload, secret)
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false

  const age = Date.now() - Number(issuedAtValue)
  return age >= minimumAgeSeconds * 1000 && age <= maximumAgeSeconds * 1000
}

interface TurnstileResponse {
  success: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export async function verifyTurnstile(token: unknown, secret: string, clientAddress: string, allowedHostnames = '') {
  if (typeof token !== 'string' || !token) return false
  const payload = new URLSearchParams({ secret, response: token })
  if (clientAddress && clientAddress !== 'unknown') payload.set('remoteip', clientAddress)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: payload,
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Turnstile verification failed (${response.status})`)

  const result = await response.json() as TurnstileResponse
  const hostnames = allowedHostnames.split(',').map((hostname) => hostname.trim().toLowerCase()).filter(Boolean)
  const validHostname = !hostnames.length || Boolean(result.hostname && hostnames.includes(result.hostname.toLowerCase()))
  return result.success && result.action === 'contact' && validHostname
}

const localDuplicates = new Map<string, number>()

function submissionFingerprint(contact: ContactSubmission) {
  const normalized = [contact.email, contact.phone, contact.website, contact.interest, contact.message]
    .map((value) => value.toLowerCase().replace(/\s+/g, ' ').trim())
    .join('\n')
  return createHash('sha256').update(normalized).digest('hex')
}

export async function reserveSubmission(contact: ContactSubmission, windowSeconds = 900) {
  const fingerprint = submissionFingerprint(contact)
  const now = Date.now()
  const windowMilliseconds = windowSeconds * 1000

  if (process.env.NETLIFY === 'true' || process.env.NETLIFY_BLOBS_CONTEXT) {
    const store = getStore('contact-submission-deduplication')
    const existing = await store.getMetadata(fingerprint, { consistency: 'strong' })
    const createdAt = Number(existing?.metadata.createdAt)
    if (existing && Number.isFinite(createdAt) && now - createdAt < windowMilliseconds) {
      return { duplicate: true, release: async () => {} }
    }

    const write = existing?.etag
      ? await store.set(fingerprint, String(now), { metadata: { createdAt: now }, onlyIfMatch: existing.etag })
      : await store.set(fingerprint, String(now), { metadata: { createdAt: now }, onlyIfNew: true })
    return {
      duplicate: !write.modified,
      release: async () => { await store.delete(fingerprint) },
    }
  }

  for (const [key, createdAt] of localDuplicates) {
    if (now - createdAt >= windowMilliseconds) localDuplicates.delete(key)
  }
  const previous = localDuplicates.get(fingerprint)
  if (previous && now - previous < windowMilliseconds) {
    return { duplicate: true, release: async () => {} }
  }
  localDuplicates.set(fingerprint, now)
  return {
    duplicate: false,
    release: async () => { localDuplicates.delete(fingerprint) },
  }
}

export async function processContactSubmission(
  input: ContactInput,
  options: { clientAddress: string; userAgent?: string; environment: ContactEnvironment },
) {
  if (input.company) return { ok: true, trapped: true }

  const environment = options.environment
  if (
    !environment.googleFormEndpoint || !environment.googleFormSecret || !environment.resendApiKey
    || !environment.emailFrom || !environment.notificationEmail || !environment.turnstileSecretKey
    || !environment.formSigningSecret
  ) {
    console.error('Contact delivery or spam protection is not configured.')
    throw new ContactRequestError(503, 'Contact delivery is temporarily unavailable. Please email hello@keithpotter.net.')
  }

  if (!verifyFormTimingToken(
    input.formToken,
    environment.formSigningSecret,
    environment.minimumFormAgeSeconds,
    environment.maximumFormAgeSeconds,
  )) {
    throw new ContactRequestError(400, 'The form expired or was submitted too quickly. Please try again.')
  }

  const { data, errors } = validateContact({ ...input, userAgent: options.userAgent })
  if (!data) throw new ContactRequestError(400, 'Please correct the highlighted fields.', errors)

  const human = await verifyTurnstile(
    input.turnstileToken,
    environment.turnstileSecretKey,
    options.clientAddress,
    environment.turnstileAllowedHostnames,
  )
  if (!human) throw new ContactRequestError(400, 'Spam protection could not verify this submission. Please try again.')

  const reservation = await reserveSubmission(data, environment.duplicateWindowSeconds)
  if (reservation.duplicate) {
    return { ok: true, duplicate: true }
  }

  const deliveries = await Promise.allSettled([
    sendToGoogleSheet(data, environment.googleFormEndpoint, environment.googleFormSecret),
    sendContactNotification(data, {
      apiKey: environment.resendApiKey,
      from: environment.emailFrom,
      to: environment.notificationEmail,
    }),
  ])
  const failures = deliveries.filter((delivery) => delivery.status === 'rejected')
  if (failures.length === deliveries.length) {
    await reservation.release()
    throw new AggregateError(failures.map((failure) => failure.reason), 'All contact delivery methods failed')
  }
  if (failures.length) {
    console.error('One contact delivery method failed.', failures[0]?.reason)
    return { ok: true, partial: true }
  }
  return { ok: true }
}

export async function sendToGoogleSheet(contact: ContactSubmission, endpoint: string, secret: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...contact, secret }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Google Sheets delivery failed (${response.status})`)
}

export async function sendContactNotification(contact: ContactSubmission, options: { apiKey: string; from: string; to: string }) {
  const text = [
    `New Koded by Keith inquiry`, '', `Name: ${contact.name}`, `Business: ${contact.business}`,
    `Email: ${contact.email}`, `Phone: ${contact.phone}`, `Website: ${contact.website}`,
    `Interested in: ${contact.interest}`, `Source: ${contact.sourcePage}`,
    `UTM: ${contact.utmSource || '—'} / ${contact.utmMedium || '—'} / ${contact.utmCampaign || '—'}`, '', 'Message:', contact.message,
  ].join('\n')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${options.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: options.from, to: [options.to], reply_to: contact.email, subject: `New inquiry from ${contact.name}`, text }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Email delivery failed (${response.status})`)
}

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

type ContactInput = Partial<ContactSubmission> & { company?: string }

const emailPattern = /^\S+@\S+\.\S+$/
const websitePattern = /^https:\/\/\S+$/i

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

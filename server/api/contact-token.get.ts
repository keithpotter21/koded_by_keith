import { createError, defineEventHandler, setHeader } from 'h3'
import { createFormTimingToken } from '~/server/utils/contact'

export default defineEventHandler((event) => {
  const secret = process.env.CONTACT_FORM_SIGNING_SECRET
  if (!secret) {
    console.error('Contact form signing is not configured.')
    throw createError({ statusCode: 503, statusMessage: 'Spam protection is temporarily unavailable.' })
  }

  setHeader(event, 'cache-control', 'no-store, max-age=0')
  return createFormTimingToken(secret, Number(process.env.CONTACT_FORM_MIN_SECONDS) || 3)
})

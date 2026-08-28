import { createError, defineEventHandler, getHeader, getRequestIP, readBody, setResponseStatus } from 'h3'
import { isRateLimited, sendContactNotification, sendToGoogleSheet, validateContact } from '~/server/utils/contact'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body?.company) {
    setResponseStatus(event, 204)
    return null
  }

  const config = useRuntimeConfig(event)
  const limit = Number(config.contactRateLimit) || 5
  if (isRateLimited(getRequestIP(event, { xForwardedFor: true }) || 'unknown', limit)) {
    throw createError({ statusCode: 429, statusMessage: 'Please wait a moment before sending another message.' })
  }

  const { data, errors } = validateContact({ ...body, userAgent: getHeader(event, 'user-agent') })
  if (!data) throw createError({ statusCode: 400, statusMessage: 'Please correct the highlighted fields.', data: { errors } })

  if (!config.googleFormEndpoint || !config.googleFormSecret || !config.resendApiKey || !config.emailFrom || !config.contactNotificationEmail) {
    console.error('Contact delivery is not configured.')
    throw createError({ statusCode: 503, statusMessage: 'Contact delivery is temporarily unavailable. Please email hello@keithpotter.net.' })
  }

  try {
    await Promise.all([
      sendToGoogleSheet(data, config.googleFormEndpoint, config.googleFormSecret),
      sendContactNotification(data, { apiKey: config.resendApiKey, from: config.emailFrom, to: config.contactNotificationEmail }),
    ])
    return { ok: true }
  } catch (error) {
    console.error('Contact delivery failed.', error instanceof Error ? error.message : 'Unknown error')
    throw createError({ statusCode: 502, statusMessage: 'Your message could not be delivered. Please email hello@keithpotter.net.' })
  }
})

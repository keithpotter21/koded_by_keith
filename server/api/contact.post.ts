import { createError, defineEventHandler, getHeader, getRequestIP, readBody, setResponseStatus } from 'h3'
import { ContactRequestError, getContactEnvironmentFromProcess, isRateLimited, processContactSubmission } from '~/server/utils/contact'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body?.company) {
    setResponseStatus(event, 204)
    return null
  }

  const clientAddress = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const limit = Number(process.env.CONTACT_RATE_LIMIT) || 5
  if (isRateLimited(clientAddress, limit)) {
    throw createError({ statusCode: 429, statusMessage: 'Please wait a moment before sending another message.' })
  }

  try {
    return await processContactSubmission(body, {
      clientAddress,
      userAgent: getHeader(event, 'user-agent'),
      environment: getContactEnvironmentFromProcess(),
    })
  } catch (error) {
    if (error instanceof ContactRequestError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.publicMessage, data: { errors: error.errors } })
    }
    console.error('Contact delivery failed.', error instanceof Error ? error.message : 'Unknown error')
    throw createError({ statusCode: 502, statusMessage: 'Your message could not be delivered. Please email hello@keithpotter.net.' })
  }
})

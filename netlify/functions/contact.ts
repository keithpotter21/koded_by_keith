import type { Config, Context } from '@netlify/functions'
import {
  ContactRequestError,
  getContactEnvironmentFromProcess,
  processContactSubmission,
  type ContactInput,
} from '../../server/utils/contact'

export const config: Config = {
  method: 'POST',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store, max-age=0' },
  })
}

export default async (request: Request, context: Context) => {
  let body: ContactInput
  try {
    body = await request.json() as ContactInput
  } catch {
    return json({ statusMessage: 'Invalid form submission.' }, 400)
  }

  try {
    const result = await processContactSubmission(body, {
      clientAddress: context.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      environment: getContactEnvironmentFromProcess(),
    })
    return json(result)
  } catch (error) {
    if (error instanceof ContactRequestError) {
      return json({ statusMessage: error.publicMessage, data: { errors: error.errors } }, error.statusCode)
    }
    console.error('Contact delivery failed.', error instanceof Error ? error.message : 'Unknown error')
    return json({ statusMessage: 'Your message could not be delivered. Please email hello@keithpotter.net.' }, 502)
  }
}

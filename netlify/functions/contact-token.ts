import type { Config, Context } from '@netlify/functions'
import { createFormTimingToken, getContactEnvironmentFromProcess } from '../../server/utils/contact'

export const config: Config = {
  method: 'GET',
  rateLimit: {
    windowLimit: 20,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}

export default async (_request: Request, _context: Context) => {
  const environment = getContactEnvironmentFromProcess()
  if (!environment.formSigningSecret) {
    console.error('Contact form signing is not configured.')
    return Response.json(
      { statusMessage: 'Spam protection is temporarily unavailable.' },
      { status: 503, headers: { 'cache-control': 'no-store, max-age=0' } },
    )
  }

  return Response.json(
    createFormTimingToken(environment.formSigningSecret, environment.minimumFormAgeSeconds),
    { headers: { 'cache-control': 'no-store, max-age=0' } },
  )
}

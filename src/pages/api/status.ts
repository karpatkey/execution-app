import { getSession } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getStatus as getDebankStatus } from 'src/services/debank/debank'
import { getDaosConfigsStatus } from 'src/services/executor/strategies'
import { getStatus as getPulleyStatus } from 'src/services/pulley'

type Response = {
  status: 'ok' | 'error'
  error?: string
  statuses?: Record<string, any>
  env?: any
}

function filteredEnv() {
  const env = process.env as Record<string, string>

  return Object.keys(env)
    .filter(
      (k) => k.indexOf('PRIVATE_KEY') == -1 && k.indexOf('SECRET') == -1 && k.indexOf('KEY') == -1,
    )
    .reduce((obj: any, key: string) => {
      obj[key] = env[key]
      return obj
    }, {})
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  // Should be a get request
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' })
  }

  const session = await getSession(req as any, res as any)
  const accessToken = req.query['TOKEN_SECRET']
  const validAccessToken = process.env.HEALTHZ_TOKEN && accessToken == process.env.HEALTHZ_TOKEN

  // Either user is login or accessToken query param is valid
  if (!session && !validAccessToken) {
    return res.status(401).json({ status: 'error', error: 'Unauthorized' })
  }

  try {
    const [debank, pulley, strats] = await Promise.all([
      getDebankStatus(),
      getPulleyStatus(),
      getDaosConfigsStatus(),
    ])

    const ok = ![debank, pulley, strats].find((status: any) => !status.ok)

    const status = ok ? 200 : 500

    return res.status(status).json({
      status: ok ? 'ok' : 'error',
      statuses: {
        debank,
        pulley,
        strats,
      },
      ...(validAccessToken
        ? {
            env: filteredEnv(),
          }
        : {}),
    })
  } catch (error) {
    console.error('ERROR Reject: ', error)
  }

  return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
}

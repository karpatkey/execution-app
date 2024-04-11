import { getSession } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getStatus as getDebankStatus } from 'src/services/debank/debank'
import { getDaosConfigsStatus } from 'src/services/executor/strategies'
import { getStatus as getPulleyStatus } from 'src/services/pulley'

type Response = {
  ok: boolean
  error?: string
  statuses?: Record<string, any>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  // Should be a get request
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const session = await getSession(req as any, res as any)
  const accessToken = req.query['accessToken']

  // Either user is login or accessToken query param is valid
  if (!session && accessToken !== process.env.HEALTHZ_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
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
      ok: ok,
      statuses: {
        debank,
        pulley,
        strats,
      },
    })
  } catch (error) {
    console.error('ERROR Reject: ', error)
  }

  return res.status(500).json({ ok: false, error: 'Internal Server Error' })
}

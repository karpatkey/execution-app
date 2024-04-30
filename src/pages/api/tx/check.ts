import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/authorizer'
import { executorEnv } from 'src/services/executor/env'
import { RolesApi } from 'src/services/rolesapi'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

type Params = {
  blockchain?: Blockchain
  dao?: Dao
  protocol?: string
  tx_transactables?: any[]
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { blockchain, dao = '', protocol, tx_transactables } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')
    if (!protocol || !tx_transactables) {
      return res.status(500).json({ status: 500, error: 'Missing params' })
    }

    const env = await executorEnv(blockchain)
    try {
      // Execute the transaction builder
      const api = new RolesApi(dao, blockchain, env.fork?.url)
      const response = await api.checkTransaction(protocol, tx_transactables)

      return res.status(200).json(response)
    } finally {
      env.release()
    }
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  } finally {
  }
})

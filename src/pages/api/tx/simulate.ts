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
  blockchain: Maybe<Blockchain>
  dao: Maybe<Dao>
  transaction: Maybe<any>
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    // Get common parameters from the body
    const { blockchain, transaction, dao = '' } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')

    const env = await executorEnv(blockchain)

    try {
      const api = new RolesApi(dao, blockchain, env.fork?.url)
      const response = await api.simulateTransaction(transaction)

      return res
        .status(response.status || 400)
        .json({ ...response.sim_data, error: response.sim_data?.error_message })
    } finally {
      env.release()
    }
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

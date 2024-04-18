import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/authorizer'
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
  transactables?: any[]
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { blockchain, dao = '', protocol, transactables } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')
    if (!protocol || !transactables) {
      return res.status(500).json({ status: 500, error: 'Missing params' })
    }

    // Execute the transaction builder
    const api = new RolesApi(dao, blockchain)

    const response = await api.checkTransaction(protocol, transactables)

    return res.status(response.status || 400).json(response)
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

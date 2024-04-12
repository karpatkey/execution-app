import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/autorizer'
import { executorEnv } from 'src/services/executor/env'
import { REVERSE_DAO_MAPPER } from 'src/services/executor/strategies'
import { Script, runScript } from 'src/services/pythoner'

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

    const parameters: string[] = [
      ['--dao', REVERSE_DAO_MAPPER[dao]],
      ['--blockchain', `${blockchain.toUpperCase()}`],
      ['--transaction', `${JSON.stringify(transaction)}`],
    ].flat()

    const env = await executorEnv(blockchain)

    try {
      // Execute the transaction builder
      const scriptResponse = await runScript(Script.Simulate, parameters, env.env)

      return res.status(200).json(scriptResponse)
    } finally {
      env.release()
    }
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

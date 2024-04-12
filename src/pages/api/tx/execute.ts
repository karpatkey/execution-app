import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { getEthersProvider } from 'src/services/ethers'
import { executorEnv } from 'src/services/executor/env'
import { Signor } from 'src/services/signer'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

type Params = {
  blockchain: Maybe<Blockchain>
  dao: Maybe<Dao>
  transaction: Maybe<any>
  decoded: Maybe<any>
}

import { authorizedDao } from 'src/services/authorizer'

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    // Should be a post request
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { transaction, decoded, blockchain, dao = '' } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')

    const env = await executorEnv(blockchain)

    if (!decoded || !transaction) throw new Error('Missing required param')

    try {
      const provider = await getEthersProvider(blockchain, env.env)
      const signor = new Signor({ blockchain, dao, provider, env: env.env })
      const txResponse = await signor.sendTransaction(transaction)

      const txReceipt = await txResponse.wait()

      if (txReceipt?.status == 1) {
        // TODO cleanup Roles royce creates the order now so we don't need this
        //
        // const cowsigner = new CowswapSigner(blockchain, decoded)
        // if (cowsigner.isCowswap()) {
        //   await cowsigner.createOrder()
        // }

        return res.status(200).json({ data: { tx_hash: txResponse.hash } })
      } else {
        throw new Error('Failed transaction receipt')
      }
    } finally {
      env.release()
    }
  } catch (e: any) {
    console.error('ExecutionError', e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

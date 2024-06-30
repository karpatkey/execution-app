import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { executorEnv } from 'src/services/executor/env'
import { Signor } from 'src/services/signer'

export type Response = {
  tx_hash?: string
  status?: number
  error?: string
}

export type Params = {
  blockchain?: Blockchain
  dao?: Dao
  connectedWallet?: string
  transaction?: any
}

import { authorizedDao } from 'src/services/authorizer'

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    // Should be a post request
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { transaction, blockchain, dao = '', connectedWallet = '' } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')

    const env = await executorEnv({ blockchain, dao, connectedWallet })

    if (!transaction) throw new Error('Missing required param')

    const signor = new Signor({ blockchain, dao, env })
    const txResponse = await signor.sendTransaction(transaction)

    const { status, hash: tx_hash } = (await txResponse.wait()) ?? {}

    if (!status) return res.status(200).json({ error: 'Transaction reverted', tx_hash })
    if (!tx_hash) return res.status(200).json({ error: 'Error trying to execute transaction' })

    if (status == 1) {
      // TODO cleanup Roles royce creates the order now so we don't need this
      //
      // const cowsigner = new CowswapSigner(blockchain, decoded)
      // if (cowsigner.isCowswap()) {
      //   await cowsigner.createOrder()
      // }

      return res.status(200).json({ tx_hash })
    } else {
      throw new Error('Failed transaction receipt')
    }
  } catch (e: any) {
    console.error('ExecutionError', e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

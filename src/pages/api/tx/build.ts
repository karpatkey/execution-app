import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao, getStrategyByPositionId } from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/authorizer'
import { getDaosConfigs } from 'src/services/executor/strategies'
import { RolesApi } from 'src/services/rolesapi'

export type Response = {
  data?: any
  status?: number
  error?: string
}
export type ExitArgs = {
  pool_id: string
  rewards_address?: string
  max_slippage?: number
  token_in_address?: string
  token_out_address?: string
  bpt_address?: string
}

export type Params = {
  blockchain?: Blockchain
  dao?: Dao
  strategy?: string
  percentage?: number
  protocol?: string
  exit_arguments: ExitArgs[]
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const {
      blockchain,
      dao = '',
      strategy,
      percentage,
      protocol,
      exit_arguments,
    } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')
    if (!percentage) throw new Error('missing percentage')
    if (!protocol || !strategy) {
      return res.status(500).json({ status: 500, error: 'Missing params' })
    }

    const daosConfigs = await getDaosConfigs(dao ? [dao] : [])

    const args = exit_arguments.map((args) => {
      const pool_id = args.pool_id
      const { positionConfig } = getStrategyByPositionId(daosConfigs, dao, blockchain, pool_id)
      const execConfig = positionConfig.find((c) => c.function_name === strategy)
      const a = new Map()

      execConfig?.parameters?.forEach((parameter) => {
        if (parameter.type === 'constant') a.set(parameter.name, parameter.value)
      })
      // Add the rest of the parameters if needed. User provided arguments
      Object.entries(args || {}).forEach(([key, value]) => {
        if (value) a.set(key, value)
      })

      return Object.fromEntries(a.entries())
    })

    // Execute the transaction builder
    const api = new RolesApi(dao, blockchain)
    const response = await api.buildTransaction(protocol, strategy, percentage, args)

    return res
      .status(200)
      .json({ status: response.status, ...response.tx_data, error: response.error })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

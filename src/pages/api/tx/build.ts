import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Blockchain, Dao, getStrategyByPositionId } from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/authorizer'
import { getDaosConfigs } from 'src/services/executor/strategies'
import { RolesApi } from 'src/services/rolesapi'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

type Params = {
  blockchain?: Blockchain
  dao?: Dao
  strategy?: string
  percentage?: number
  pool_id?: string
  protocol?: string
  exit_arguments?: {
    rewards_address?: string
    max_slippage?: number
    token_in_address?: string
    token_out_address?: string
    bpt_address?: string
  }
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const {
      blockchain,
      dao = '',
      strategy,
      percentage,
      pool_id,
      protocol,
      exit_arguments,
    } = req.body as Params

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ error: 'Unauthorized' })

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')
    if (!percentage) throw new Error('missing percentage')
    if (!pool_id || !protocol || !strategy) {
      return res.status(500).json({ status: 500, error: 'Missing params' })
    }

    const daosConfigs = await getDaosConfigs(dao ? [dao] : [])

    const { positionConfig } = getStrategyByPositionId(daosConfigs, dao, blockchain, pool_id)
    const execConfig = positionConfig.find((c) => c.function_name === strategy)

    const args = new Map()
    execConfig?.parameters?.forEach((parameter) => {
      if (parameter.type === 'constant') args.set(parameter.name, parameter.value)
    })
    // Add the rest of the parameters if needed. User provided arguments
    Object.entries(exit_arguments || {}).forEach(([key, value]) => {
      if (value) args.set(key, value)
    })

    const argsParams = Object.fromEntries(args.entries())
    // Execute the transaction builder
    const api = new RolesApi(dao, blockchain)
    const response = await api.buildTransaction(protocol, strategy, percentage, [argsParams])

    return res
      .status(200)
      .json({ status: response.status, ...response.tx_data, error: response.error })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

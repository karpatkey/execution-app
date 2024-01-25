import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, Session } from '@auth0/nextjs-auth0'
import {
  BLOCKCHAIN,
  DAO,
  getDAOFilePath,
  getStrategyByPositionId
} from 'src/config/strategies/manager'
import { EXECUTION_TYPE } from 'src/config/strategies/manager'
import { CommonExecutePromise } from 'src/utils/execute'

type Status = {
  data?: Maybe<any>
  error?: Maybe<string>
}

// Create a mapper for DAOs
const DAO_MAPPER: Record<string, string> = {
  'Gnosis DAO': 'GnosisDAO',
  'Gnosis Ltd': 'GnosisLtd',
  'karpatkey DAO': 'karpatkey'
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>
) {
  // Should be a post request
  if (req.method !== 'POST') {
    res.status(405).json({ data: { status: false, error: new Error('Method not allowed') } })
    return
  }

  const session = await getSession(req as any, res as any)

  // Validate session here
  if (!session) {
    res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })
    return
  }

  // Get common parameters from the body
  const {
    execution_type,
    blockchain,
    dao = ''
  } = req.body as {
    execution_type: EXECUTION_TYPE
    blockchain: Maybe<BLOCKCHAIN>
    dao: Maybe<DAO>
  }

  // Get User role, if not found, return an error
  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const DAOs = roles
  if (!DAOs) {
    res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })
    return
  }

  if (dao && !DAOs.includes(dao)) {
    res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })
    return
  }

  const parameters: any[] = []

  if (dao) {
    parameters.push('--dao')
    parameters.push(DAO_MAPPER[dao])
  }

  if (blockchain) {
    parameters.push('--blockchain')
    parameters.push(`${blockchain.toUpperCase()}`)
  }

  const filePath = getDAOFilePath(
    dao as DAO,
    blockchain as BLOCKCHAIN,
    execution_type as EXECUTION_TYPE
  )

  console.log('FilePath', filePath)

  if (execution_type === 'transaction_builder') {
    try {
      // Build de arguments for the transaction builder

      // Get the strategy from the body, if not found, return an error
      const { strategy, percentage, position_id, protocol, exit_arguments } = req.body as {
        strategy: Maybe<string>
        percentage: Maybe<number>
        position_id: Maybe<string>
        protocol: Maybe<string>
        exit_arguments: {
          rewards_address: Maybe<string>
          max_slippage: Maybe<number>
          token_out_address: Maybe<string>
          bpt_address: Maybe<string>
        }
      }

      // Add the rest of the parameters if needed
      if (percentage) {
        parameters.push('--percentage')
        parameters.push(`${percentage}`)
      }

      if (strategy) {
        parameters.push('--exit-strategy')
        parameters.push(`${strategy}`)
      }

      if (protocol) {
        parameters.push('--protocol')
        parameters.push(`${protocol}`)
      }

      let exitArguments = {}

      // Add CONSTANTS from the strategy
      if (protocol) {
        const { positionConfig } = getStrategyByPositionId(
          dao as DAO,
          blockchain as unknown as BLOCKCHAIN,
          protocol,
          position_id as string
        )
        const positionConfigItemFound = positionConfig?.find(
          (positionConfigItem) => positionConfigItem.function_name === strategy
        )

        positionConfigItemFound?.parameters?.forEach((parameter) => {
          if (parameter.type === 'constant') {
            exitArguments = {
              ...exitArguments,
              [parameter.name]: parameter.value
            }
          }
        })
      }

      // Add the rest of the parameters if needed
      for (const key in exit_arguments) {
        const value = exit_arguments[key as keyof typeof exit_arguments]
        if (value) {
          exitArguments = {
            ...exitArguments,
            [key]: value
          }
        }
      }

      if (Object.keys(exitArguments).length > 0) {
        parameters.push('--exit-arguments')
        parameters.push(`[${JSON.stringify(exitArguments)}]`)
      }

      console.log('Parameters', parameters)

      // Execute the transaction builder
      const { status = 500, data, error } = await CommonExecutePromise(filePath, parameters)

      if (error && status !== 200) {
        console.error('ERROR: ', error)
        return res.status(status).json({ data, error })
      }

      return res.status(status).json({ data, error })
    } catch (error) {
      console.error('ERROR Reject: ', error)
      return res.status(500).json({ error: (error as Error)?.message })
    }
  }

  if (execution_type === 'simulate' || execution_type === 'execute') {
    try {
      // Build de arguments for the transaction builder

      // Get the strategy from the body, if not found, return an error
      const { transaction } = req.body as {
        transaction: Maybe<any>
      }

      // Add the rest of the parameters if needed
      if (transaction) {
        parameters.push('--transaction')
        parameters.push(`${JSON.stringify(transaction)}`)
      }

      // Execute the transaction builder
      const { status = 500, data, error } = await CommonExecutePromise(filePath, parameters)

      if (error && status !== 200) {
        console.error('ERROR: ', error)
        return res.status(status).json({ data, error })
      }

      return res.status(status).json({ data, error })
    } catch (error) {
      console.error('ERROR Reject: ', error)
      return res.status(500).json({ error: (error as Error)?.message })
    }
  }

  return res.status(500).json({ error: 'Internal Server Error' })
})

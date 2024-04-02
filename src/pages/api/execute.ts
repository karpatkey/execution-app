import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  Blockchain,
  Dao,
  ExecutionType,
  getDAOFilePath,
  getStrategyByPositionId,
} from 'src/config/strategies/manager'
import { CowswapSigner } from 'src/services/cowswap'
import { getEthersProvider } from 'src/services/ethers'
import { getDaosConfigs } from 'src/services/executor/strategies'
import { Signor } from 'src/services/signer'
import { CommonExecutePromise } from 'src/utils/execute'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

// Create a mapper for DAOs
const DAO_MAPPER: Record<string, string> = {
  'Gnosis DAO': 'GnosisDAO',
  'Gnosis Ltd': 'GnosisLtd',
  'karpatkey DAO': 'karpatkey',
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  // Should be a post request
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const session = await getSession(req as any, res as any)

  // Validate session here
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Get common parameters from the body
  const {
    execution_type,
    blockchain,
    dao = '',
  } = req.body as {
    execution_type: ExecutionType
    blockchain: Maybe<Blockchain>
    dao: Maybe<Dao>
    decoded: Maybe<any>
  }

  // Get User role, if not found, return an error
  const user = (session as Session).user
  const daos = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  if (!daos) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (dao && !daos.includes(dao)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!blockchain) {
    res.status(400).json({ error: 'Invalid params' })
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

  const daosConfigs = await getDaosConfigs(dao ? [dao] : [])

  const filePath = getDAOFilePath(execution_type as ExecutionType)

  if (execution_type === 'transaction_builder') {
    try {
      // Build de arguments for the transaction builder

      // Get the strategy from the body, if not found, return an error
      const { strategy, percentage, pool_id, protocol, exit_arguments } = req.body as {
        strategy: Maybe<string>
        percentage: Maybe<number>
        pool_id: Maybe<string>
        protocol: Maybe<string>
        exit_arguments: {
          rewards_address: Maybe<string>
          max_slippage: Maybe<number>
          token_out_address: Maybe<string>
          bpt_address: Maybe<string>
        }
      }

      if (!pool_id || !protocol || !strategy) {
        return res.status(500).json({ status: 500, error: 'Missing params' })
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
          daosConfigs,
          dao as Dao,
          blockchain as unknown as Blockchain,
          pool_id || '',
        )
        const positionConfigItemFound = positionConfig?.find(
          (positionConfigItem) => positionConfigItem.function_name === strategy,
        )

        positionConfigItemFound?.parameters?.forEach((parameter) => {
          if (parameter.type === 'constant') {
            exitArguments = {
              ...exitArguments,
              [parameter.name]: parameter.value,
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
            [key]: value,
          }
        }
      }

      if (Object.keys(exitArguments).length > 0) {
        parameters.push('--exit-arguments')
        parameters.push(`[${JSON.stringify(exitArguments)}]`)
      }

      console.log('Parameters', parameters)

      // Execute the transaction builder
      const { status, data, error } = await CommonExecutePromise(filePath, parameters)

      return res.status(200).json({ data, status, error })
    } catch (error) {
      console.error('TRANSACTION_BUILDER_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  if (execution_type === 'execute') {
    try {
      const { transaction, decoded } = req.body as {
        transaction: Maybe<any>
        decoded: Maybe<any>
      }

      if (!decoded || !transaction) throw new Error('Missing required param')

      const provider = getEthersProvider(blockchain)
      const signor = new Signor(provider)
      const txResponse = await signor.sendTransaction(transaction)

      const txReceipt = await txResponse.wait()

      if (txReceipt?.status == 1) {
        const cowsigner = new CowswapSigner(blockchain, decoded)
        if (cowsigner.needsMooofirmation()) {
          await cowsigner.moooIt()
        }

        return res.status(200).json({ data: { tx_hash: txResponse.hash } })
      } else {
        throw new Error('Failed transaction receipt')
      }
    } catch (error) {
      console.error('EXECUTION_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
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
      const { status, data, error } = await CommonExecutePromise(filePath, parameters)

      return res.status(200).json({ data, error, status })
    } catch (error) {
      console.error('EXECUTION_SIMULATION_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  return res.status(500).json({ error: 'Internal Server Error', status: 500 })
})

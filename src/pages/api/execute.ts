import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  BLOCKCHAIN,
  DAO,
  EXECUTION_TYPE,
  getDAOFilePath,
  getStrategyByPositionId,
} from 'src/config/strategies/manager'
import { Pulley } from 'src/services/pulley'
import { CommonExecutePromise } from 'src/utils/execute'
import { getDaosConfigs } from 'src/utils/jsonsFetcher'

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

function filteredObject(raw: any, allowed: string[]) {
  function match(key: string, rule: string) {
    rule = rule.split('*').join('.*')
    rule = '^' + rule + '$'
    const regex = new RegExp(rule)
    return regex.test(key)
  }
  return Object.keys(process.env)
    .filter((key) => allowed.includes(key) || allowed.find((r) => match(key, r)))
    .reduce((obj: any, key) => {
      obj[key] = raw[key]
      return obj
    }, {})
}

async function executorEnv(blockchain: string) {
  const chain = { ethereum: 1, gnosis: 100 }[blockchain.toLowerCase()]
  if (!chain) throw new Error(`Invalid blockchain ${blockchain}`)

  const fork = await Pulley.start(chain)

  const filtered = filteredObject(process.env, [
    'SHELL',
    'PATH',
    'PWD',
    // 'LANG',
    // 'HOME',
    'MODE',
    'ENVIRONMENT',

    '*_AVATAR_SAFE_ADDRESS',
    '*_ROLES_MOD_ADDRESS',
    '*_ROLE',
    '*_DISASSEMBLER_ADDRESS',
    'TENDERLY_*',
  ])
  const env = {
    ...filtered,
    LOCAL_FORK_URL: fork.url,
  }

  return {
    env,
    fork,
    release: () => fork.release(),
  }
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
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
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (dao && !DAOs.includes(dao)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const parameters: any[] = []

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')

    parameters.push('--dao')
    parameters.push(DAO_MAPPER[dao])
    parameters.push('--blockchain')
    parameters.push(`${blockchain.toUpperCase()}`)

    const daosConfigs = await getDaosConfigs([dao || ''])

    const filePath = getDAOFilePath(execution_type as EXECUTION_TYPE)

    const env = await executorEnv(blockchain)

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
            dao as DAO,
            blockchain as unknown as BLOCKCHAIN,
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

        console.log('Executing', [filePath, ...parameters].join(' '))

        // Execute the transaction builder
        const { status, data, error } = await CommonExecutePromise(filePath, parameters, env.env)

        return res.status(200).json({ data, status, error })
      } catch (error) {
        console.error('ERROR Reject: ', error)
        return res.status(500).json({ error: (error as Error)?.message, status: 500 })
      } finally {
        env.release()
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
        const { status, data, error } = await CommonExecutePromise(filePath, parameters, env.env)

        return res.status(200).json({ data, error, status })
      } catch (error) {
        console.error('ERROR Reject: ', error)
        return res.status(500).json({ error: (error as Error)?.message, status: 500 })
      } finally {
        env.release()
      }
    }

    return res.status(500).json({ error: 'Internal Server Error', status: 500 })
  } catch (e) {
    console.error(e)
    throw e
  }
})

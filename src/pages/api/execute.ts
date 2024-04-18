import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  Blockchain,
  Dao,
  ExecutionType,
  getDAOFilePath,
  getStrategyByPositionId,
} from 'src/config/strategies/manager'
import { authorizedDao } from 'src/services/autorizer'
import { REVERSE_DAO_MAPPER, getDaosConfigs } from 'src/services/executor/strategies'
import { Pulley } from 'src/services/pulley'
import { Signor } from 'src/services/signer'
import { CommonExecutePromise } from 'src/utils/execute'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

function filteredObject(raw: any, allowed: string[]) {
  function match(key: string, rule: string) {
    if (rule[0] == '*') {
      return key.endsWith(rule.substring(1))
    }
    if (rule[rule.length - 1] == '*') {
      return key.startsWith(rule.substring(0, rule.length - 1))
    }
    return false
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

  let fork: Pulley | null = null
  if (process.env.MODE != 'production') {
    fork = await Pulley.start(chain)
  }

  const filtered = filteredObject(process.env, [
    'PATH',
    'MODE',
    'ENVIRONMENT',
    '*_AVATAR_SAFE_ADDRESS',
    '*_ROLES_MOD_ADDRESS',
    '*_ROLE',
    '*_DISASSEMBLER_ADDRESS',
    'TENDERLY_*',
    '*_RPC_ENDPOINT',
    '*_RPC_ENDPOINT_MEV',
    '*_RPC_ENDPOINT_FALLBACK',
    'VAULT_*',
  ])

  const env = !!fork ? { ...filtered, LOCAL_FORK_URL: fork.url } : filtered

  return {
    env,
    fork,
    release: () => fork && fork.release(),
  }
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  try {
    // Should be a post request
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    // Get common parameters from the body
    const {
      execution_type,
      blockchain,
      dao = '',
    } = req.body as {
      execution_type: ExecutionType
      blockchain: Maybe<Blockchain>
      dao: Maybe<Dao>
    }

    const { error } = await authorizedDao({ req, res }, dao)
    if (error) return res.status(401).json({ data: { status: false, error } })

    const parameters: any[] = []

    if (!dao) throw new Error('missing dao')
    if (!blockchain) throw new Error('missing blockchain')

    parameters.push('--dao')
    parameters.push(REVERSE_DAO_MAPPER[dao])
    parameters.push('--blockchain')
    parameters.push(`${blockchain.toUpperCase()}`)

    const daosConfigs = await getDaosConfigs(dao ? [dao] : [])

    const filePath = getDAOFilePath(execution_type as ExecutionType)

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
            token_in_address: Maybe<string>
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

    if (execution_type === 'simulate') {
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

    if (execution_type === 'execute') {
      try {
        const { transaction, decoded } = req.body as {
          transaction: Maybe<any>
          decoded: Maybe<any>
        }

        if (!decoded || !transaction) throw new Error('Missing required param')

        const signor = new Signor({ blockchain, dao, env: env.env })
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
      } catch (error) {
        console.error('ERROR Reject: ', error)
        return res.status(500).json({ error: (error as Error)?.message, status: 500 })
      } finally {
        env.release()
      }
    }

    return res.status(500).json({ error: 'Internal Server Error', status: 500 })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: `Internal Server Error ${e.message}`, status: 500 })
  }
})

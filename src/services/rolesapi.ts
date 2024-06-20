import { Blockchain, Dao } from 'src/config/strategies/manager'
import { REVERSE_DAO_MAPPER } from 'src/services/executor/strategies'

export type Protocol = string
export type Strategy = string
export type StrategyArguments = {
  rewards_address: string
  max_slippage: number
  token_in_address: string
  token_out_address: string
  bpt_address: string
}

async function request(path: string, body: Record<string, any>) {
  const url = process.env.ROLESAPI_URL + path
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const b: any = await r.json()

    const error: string =
      r.status !== 200
        ? b.error || (b.detail && JSON.stringify(b.detail)) || 'Request failed'
        : undefined

    return {
      status: r.status,
      error,
      ...b,
    }
  } catch (e: any) {
    console.error(`RolesApiError: ${url}`, e)
    return { error: `RolesApiError: ${e.message} ${url}` }
  }
}

export class RolesApi {
  dao: string
  blockchain: string
  rpc_url?: string

  constructor(dao: Dao, blockchain: Blockchain, rpc_url?: string) {
    this.dao = REVERSE_DAO_MAPPER[dao]
    this.blockchain = blockchain.toUpperCase()
    this.rpc_url = rpc_url
  }

  async buildTransaction(
    protocol: Protocol,
    strategy: Strategy,
    percentage: number,
    args: StrategyArguments[],
  ) {
    return await request('/build', {
      rpc_url: this.rpc_url,
      dao: this.dao,
      blockchain: this.blockchain,
      protocol,
      strategy,
      percentage,
      arguments: args,
    })
  }

  async checkTransaction(protocol: Protocol, tx_transactables: any[]) {
    return await request('/check', {
      rpc_url: this.rpc_url,
      dao: this.dao,
      blockchain: this.blockchain,
      protocol,
      tx_transactables,
    })
  }

  async simulateTransaction(transaction: string) {
    return await request('/simulate', {
      rpc_url: this.rpc_url,
      dao: this.dao,
      blockchain: this.blockchain,
      transaction,
    })
  }
}

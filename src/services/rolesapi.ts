import { daoManagerRole } from 'src/config/constants'
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

const LOG_LABEL = '[RolesApi]'

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

    console.log(`${LOG_LABEL} Response status for ${path}: ${r.status}`)

    if (r.status != 200) {
      throw new Error('Failed ' + (await r.text()))
    }
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
    console.error(`${LOG_LABEL} RolesApiError: ${url}`, e)
    return { error: `RolesApiError: ${e.message} ${url}` }
  }
}

export type Args = {
  dao: Dao
  blockchain: Blockchain
  connectedWallet?: string
  rpc_url?: string
}

export class RolesApi {
  dao: string
  blockchain: Blockchain
  connectedWallet?: string
  rpc_url?: string

  constructor({ dao, blockchain, connectedWallet, rpc_url }: Args) {
    this.dao = REVERSE_DAO_MAPPER[dao]
    this.blockchain = blockchain
    this.rpc_url = rpc_url
    this.connectedWallet = connectedWallet
  }

  async buildTransaction(
    protocol: Protocol,
    strategy: Strategy,
    percentage: number,
    args: StrategyArguments[],
  ) {
    return await request('/build', {
      env: this.getEnv(),
      protocol,
      strategy,
      percentage,
      arguments: args,
    })
  }

  async checkTransaction(protocol: Protocol, tx_transactables: any[]) {
    return await request('/check', {
      env: this.getEnv(),
      protocol,
      tx_transactables,
    })
  }

  getEnv() {
    const role = daoManagerRole(this.dao, this.blockchain, this.connectedWallet)

    console.log({ connectedWallet: this.connectedWallet, role })

    return {
      rpc_url: this.rpc_url || this.getConfig('rpc_endpoint'),
      rpc_fallback_url: this.getConfig('rpc_endpoint_fallback'),
      mode: 'production',
      avatar_safe_address: this.getDaoConfig('avatar_safe_address'),
      roles_mod_address: this.getDaoConfig('roles_mod_address'),
      disassembler_address: role?.address || this.getDaoConfig('disassembler_address'),
      role: role?.role || this.getDaoConfig('role'),
    }
  }

  getDaoConfig(name: string) {
    const key = [this.dao, this.blockchain, name].map((s) => s.toUpperCase()).join('_')
    return process.env[key]
  }

  getConfig(name: string) {
    const key = [this.blockchain, name].map((s) => s.toUpperCase()).join('_')
    return process.env[key]
  }
}

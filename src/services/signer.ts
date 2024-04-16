import { JsonRpcProvider, ethers } from 'ethers'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { AnvilTools } from './dev_tools'

type Transaction = Record<string, any>

// const NORMAL_GAS_LIMIT_MULTIPLIER = 1.4
// const AGGRESIVE_GAS_LIMIT_MULTIPLIER = 3
// const NORMAL_FEE_MULTIPLER = 1.2
const AGGRESIVE_FEE_MULTIPLER = 2

const TEST_PRIV_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

function testAddress() {
  return ethers.computeAddress(TEST_PRIV_KEY)
}

type StatusResponse = {
  ok: boolean
  error?: string
  accounts?: any
}

type Env = Record<string, string> | NodeJS.ProcessEnv

export async function getStatus(): Promise<StatusResponse> {
  try {
    const res = await callVaultEthsigner(
      { method: 'GET', path: '/accounts?list=true' },
      process.env,
    )

    if (!res.data || !res.data.keys || res.data.keys.length == 0) {
      return {
        ok: false,
        error: 'No keys imported',
      }
    }

    return {
      ok: true,
      accounts: res.data.keys,
    }
  } catch (error: any) {
    console.error(error)

    return {
      ok: false,
      error: error.message,
    }
  }
}

async function callVaultEthsigner(request: Record<string, any>, env: Env) {
  const signerUrl = env.VAULT_SIGNER_URL
  const vaultToken = env.VAULT_SIGNER_TOKEN

  if (!signerUrl && !vaultToken) throw new Error('Signer: Missing vault signer configs')
  if (!signerUrl) throw new Error('Signer: Missing signer url')
  if (!vaultToken) throw new Error('Signer: Missing config VAULT_SIGNER_TOKEN')

  const url = signerUrl + request.path

  const body = request.body
    ? JSON.stringify(request.body, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      )
    : undefined

  const req = {
    method: request.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vaultToken}`,
    },
    body,
  }

  const response = await fetch(url, req)
  const res = await response.json()

  if (response.status !== 200 || (res.errors || []).length > 0) {
    throw new Error(
      `Signer Request failed: url=${url} status=${response.status} errors=[${(res.errors || []).join(', ')}]`,
    )
  }

  return res
}

export class Signor {
  provider: JsonRpcProvider
  devMode: boolean
  vaultToken?: string
  env: Env
  dao: Dao
  blockchain: Blockchain

  constructor({
    env,
    dao,
    blockchain,
    provider,
  }: {
    dao: Dao
    blockchain: Blockchain
    env: Record<string, string>
    provider: JsonRpcProvider
  }) {
    this.provider = provider
    this.devMode = env.MODE == 'development'
    this.env = env || process.env
    this.vaultToken = this.env.VAULT_SIGNER_TOKEN
    this.dao = dao
    this.blockchain = blockchain
  }

  getSignerUrl() {
    return this.env.VAULT_SIGNER_URL
  }

  async sendTransaction(transaction: Transaction) {
    if (this.devMode) {
      transaction.from = testAddress()

      const anvil = new AnvilTools(this.provider)
      await anvil.assignRole({
        ...this.getRoleParams(),
        assignee: transaction.from,
      })
    }

    transaction = await this.updateGasAndNonce(transaction)

    const path = `/accounts/${transaction.from.toLowerCase()}/sign`
    const resp = await callVaultEthsigner({ path, body: transaction }, this.env)

    return await this.provider.broadcastTransaction(resp?.data?.signedTx)
  }

  private async updateGasAndNonce(transaction: Transaction) {
    const gasStrategyFeeMultiplier = AGGRESIVE_FEE_MULTIPLER

    const latestBlock = await this.provider.getBlock('latest')
    const baseFeePerGas = Number(latestBlock?.baseFeePerGas || 1)
    const feeData = await this.provider.getFeeData()
    const { maxPriorityFeePerGas } = feeData
    const maxFeePerGas =
      Number(maxPriorityFeePerGas || 1) + Math.round(baseFeePerGas * gasStrategyFeeMultiplier)

    const nonce = await this.provider.getTransactionCount(transaction.from)

    return {
      ...transaction,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    }
  }

  private getRoleParams() {
    let key =
      new Map([['karpatkey DAO', 'KARPATKEY']]).get(this.dao) ||
      this.dao.replaceAll(' ', '').toUpperCase()

    key += '_' + this.blockchain.toUpperCase()

    return {
      avatar_safe_address: this.env[key + '_AVATAR_SAFE_ADDRESS'] as string,
      roles_mod_address: this.env[key + '_ROLES_MOD_ADDRESS'] as string,
      role: this.env[key + '_ROLE'] as unknown as number,
    }
  }
}

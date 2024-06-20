import { JsonRpcProvider, ethers, formatUnits } from 'ethers'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { getEthersProvider } from 'src/services/ethers'
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
  warning?: string
  balances: any
  threshold: string
  accounts?: any
}

type Env = Record<string, string> | NodeJS.ProcessEnv

const GAS_THRESHOLD_ETH = +(process.env.MIN_GAS_THRESHOLD || 0.2)
const GAS_THRESHOLD = BigInt(parseFloat(ethers.WeiPerEther.toString()) * GAS_THRESHOLD_ETH)

async function checkDisassemblersGas(inVaultAccounts: string[]) {
  const env = {
    MODE: 'production',
    ETHEREUM_RPC_ENDPOINT: process.env.ETHEREUM_RPC_ENDPOINT || '',
    GNOSIS_RPC_ENDPOINT: process.env.GNOSIS_RPC_ENDPOINT || '',
  }

  const providerEthP = getEthersProvider('ethereum', env, false)
  const providerGnoP = getEthersProvider('gnosis', env, false)

  const providerEth = await providerEthP
  const providerGno = await providerGnoP

  async function getBalance(key: string, disassembler: string) {
    let prov = null
    if (key.includes('_ETHEREUM_')) {
      prov = providerEth
    } else {
      prov = providerGno
    }

    return await prov.getBalance(disassembler)
  }

  const dis: any = {}
  Object.keys(process.env).forEach((k) => {
    if (k.includes('_DISASSEMBLER_')) {
      dis[k] = process.env[k]
    }
  })

  let ok = true
  const balances: any = {}
  const errors: string[] = []
  const warnings: string[] = []
  const accounts = inVaultAccounts.map((a) => a.toLowerCase())
  const promises = Object.keys(dis)
    .map((k) => [k, dis[k], getBalance(k, dis[k])])
    .map(async ([key, dis, balanceP]) => {
      const b = await balanceP
      balances[key] = formatUnits(b, 'ether')
      if (b < GAS_THRESHOLD) {
        if (accounts.includes(dis.toLowerCase())) {
          errors.push(`${key} has low gas. Current: ${balances[key]}`)
          ok = false
        } else {
          warnings.push(`${key} has low gas. Current: ${balances[key]}`)
        }
      }
    })

  await Promise.all(promises)

  return { ok, balances, errors, warnings }
}

export async function getStatus(): Promise<StatusResponse> {
  let loadedkeys: string[] = []
  let vaultError: string | undefined = undefined
  try {
    const res = await callVaultEthsigner(
      { method: 'GET', path: '/accounts?list=true' },
      process.env,
    )
    if (!res.data || !res.data.keys || res.data.keys.length == 0) {
      vaultError = 'No keys imported'
    }

    loadedkeys = res.data.keys
  } catch (error: any) {
    console.error(error)
    vaultError = `VaultError: ${error.message}`
  }

  const { ok, balances, errors, warnings } = await checkDisassemblersGas(loadedkeys)

  return {
    ok: ok && !vaultError,
    error: [vaultError || '', ...errors].filter((e) => e).join('; '),
    warning: warnings.join('; '),
    threshold: formatUnits(GAS_THRESHOLD, 'ether'),
    balances,
    accounts: loadedkeys,
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
    ? JSON.stringify(request.body, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
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

    // TODO review this with Santi or Richard
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
      new Map([
        ['karpatkey DAO', 'KARPATKEY'],
        ['ENS DAO', 'ENS'],
      ]).get(this.dao) || this.dao.replaceAll(' ', '').toUpperCase()

    key += '_' + this.blockchain.toUpperCase()

    return {
      avatar_safe_address: this.env[key + '_AVATAR_SAFE_ADDRESS'] as string,
      roles_mod_address: this.env[key + '_ROLES_MOD_ADDRESS'] as string,
      role: this.env[key + '_ROLE'] as unknown as number,
    }
  }
}

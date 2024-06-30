import { JsonRpcProvider, ethers, formatUnits } from 'ethers'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { getEthersProvider } from 'src/services/ethers'
import { AnvilTools } from './dev_tools'
import { Env } from './executor/env'
import { chainId } from './executor/mapper'
import { Pulley } from './pulley'

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

const GAS_THRESHOLD_ETH = +(process.env.GASMON_MIN_THRESHOLD || 0.2)
const GAS_THRESHOLD = BigInt(parseFloat(ethers.WeiPerEther.toString()) * GAS_THRESHOLD_ETH)
const IGNORE_ADDRESSES = (process.env.GASMON_IGNORE_ADDRESSES || '')
  .split(',')
  .filter((a) => a)
  .map((add) => add.toLowerCase())

async function checkDisassemblersGas(inVaultAccounts: string[]) {
  const providerEthP = getEthersProvider(
    'ethereum',
    { rpc_url: process.env.ETHEREUM_RPC_ENDPOINT },
    false,
  )
  const providerGnoP = getEthersProvider(
    'gnosis',
    { rpc_url: process.env.GNOSIS_RPC_ENDPOINT },
    false,
  )

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
        const addrr = dis.toLowerCase()
        if (accounts.includes(addrr) && !IGNORE_ADDRESSES.includes(addrr)) {
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
    const res = await callVaultEthsigner({ method: 'GET', path: '/accounts?list=true' })

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

const VAULT_SIGNER_URL = process.env.VAULT_SIGNER_URL
const VAULT_TOKEN = process.env.VAULT_SIGNER_TOKEN

async function callVaultEthsigner(request: Record<string, any>) {
  if (!VAULT_SIGNER_URL && !VAULT_TOKEN) throw new Error('Signer: Missing vault signer configs')
  if (!VAULT_SIGNER_URL) throw new Error('Signer: Missing signer url')
  if (!VAULT_TOKEN) throw new Error('Signer: Missing config VAULT_SIGNER_TOKEN')

  const url = VAULT_SIGNER_URL + request.path

  const body = request.body
    ? JSON.stringify(request.body, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
    : undefined

  const req = {
    method: request.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VAULT_TOKEN}`,
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
  devMode: boolean
  vaultToken?: string
  dao: Dao
  blockchain: Blockchain
  chain: number
  env: Env

  constructor({ dao, blockchain, env }: { dao: Dao; blockchain: Blockchain; env: Env }) {
    this.devMode = process.env.MODE == 'development'
    this.vaultToken = VAULT_TOKEN
    this.dao = dao
    this.blockchain = blockchain
    this.chain = chainId(this.blockchain) || 1
    this.env = env
  }

  getSignerUrl() {
    return VAULT_SIGNER_URL
  }

  async sendTransaction(transaction: Transaction) {
    let provider
    let fork

    if (this.devMode) {
      transaction.from = testAddress()

      fork = await Pulley.start(this.chain)
      provider = await getEthersProvider(this.blockchain, {
        mev_rpc_url: fork.url,
        rpc_url: fork.url,
      })

      const anvil = new AnvilTools(provider)
      await anvil.assignRole({
        ...this.getRoleParams(this.env),
        assignee: transaction.from,
      })
    } else {
      provider = await getEthersProvider(this.blockchain, this.env, true)
    }

    try {
      transaction = await this.updateGasAndNonce(provider, transaction)

      const path = `/accounts/${transaction.from.toLowerCase()}/sign`
      const resp = await callVaultEthsigner({ path, body: transaction })

      return await provider.broadcastTransaction(resp?.data?.signedTx)
    } finally {
      fork && fork.release()
    }
  }

  private async updateGasAndNonce(provider: JsonRpcProvider, transaction: Transaction) {
    const gasStrategyFeeMultiplier = AGGRESIVE_FEE_MULTIPLER

    // TODO review this with Santi or Richard
    const latestBlock = await provider.getBlock('latest')
    const baseFeePerGas = Number(latestBlock?.baseFeePerGas || 1)
    const feeData = await provider.getFeeData()
    const { maxPriorityFeePerGas } = feeData
    const maxFeePerGas =
      Number(maxPriorityFeePerGas || 1) + Math.round(baseFeePerGas * gasStrategyFeeMultiplier)

    const nonce = await provider.getTransactionCount(transaction.from)

    return {
      ...transaction,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    }
  }

  private getRoleParams(env: Env) {
    return {
      avatar_safe_address: env.avatar_safe_address || '',
      roles_mod_address: env.roles_mod_address || '',
      role: env.role,
    }
  }
}

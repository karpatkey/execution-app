import { JsonRpcProvider, ethers } from 'ethers'
import { Blockchain, Dao } from 'src/config/strategies/manager'
import { AnvilTools } from './dev_tools'
import { getEthersProvider } from './ethers'

type Transaction = Record<string, any>

// const NORMAL_GAS_LIMIT_MULTIPLIER = 1.4
// const AGGRESIVE_GAS_LIMIT_MULTIPLIER = 3
// const NORMAL_FEE_MULTIPLER = 1.2
const AGGRESIVE_FEE_MULTIPLER = 2

const TEST_PRIV_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

function testAddress() {
  return ethers.computeAddress(TEST_PRIV_KEY)
}

export class Signor {
  provider: JsonRpcProvider
  devMode: boolean
  vaultToken?: string
  env: Record<string, string> | NodeJS.ProcessEnv
  dao: Dao
  blockchain: Blockchain

  constructor({
    env,
    dao,
    blockchain,
  }: {
    dao: Dao
    blockchain: Blockchain
    env: Record<string, string>
  }) {
    this.provider = getEthersProvider(blockchain, env)
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
    const signerUrl = this.getSignerUrl()
    if (!signerUrl) {
      throw new Error('Missing signer url')
    }

    if (this.devMode) {
      transaction.from = testAddress()
      // console.log(transaction.from)

      const anvil = new AnvilTools(this.provider)

      await anvil.assignRole({
        ...this.getRoleParams(),
        assignee: transaction.from,
      })
    }

    transaction = await this.updateGasAndNonce(transaction)

    if (!this.vaultToken) throw new Error('Missing config VAULT_SIGNER_TOKEN')

    // console.log('TRANSACTION', transaction)

    const url = `${signerUrl}/accounts/${transaction.from.toLowerCase()}/sign`
    // console.log(transaction)
    // console.log(url)

    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.vaultToken}`,
      },
      body: JSON.stringify(transaction, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    }

    const response = await fetch(url, req)
    const signed = await response.json()

    if (response.status !== 200)
      throw new Error(`Failed to sign: ${(signed.errors || []).join(', ')}`)

    return await this.provider.broadcastTransaction(signed?.data?.signedTx)
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
      {
        'karpatkey DAO': 'KARPATKEY',
        'Gnosis DAO': 'GNOSISDAO',
        'Gnosis Ltd': 'GNOSISLTD',
        'Balancer LTD': 'BALANCERLTD',
        'Balancer DAO': 'BALANCERDAO',
        'CoW DAO': 'COWDAO',
        'ENS DAO': 'ENSDAO',
      }[this.dao] || '__'

    key += '_' + this.blockchain.toUpperCase()

    return {
      avatar_safe_address: this.env[key + '_AVATAR_SAFE_ADDRESS'] as string,
      roles_mod_address: this.env[key + '_ROLES_MOD_ADDRESS'] as string,
      role: this.env[key + '_ROLE'] as unknown as number,
    }
  }
}

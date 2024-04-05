import { JsonRpcProvider } from 'ethers'
import fs from 'fs'
import YAML from 'yaml'

type Transaction = Record<string, any>

// const NORMAL_GAS_LIMIT_MULTIPLIER = 1.4
// const AGGRESIVE_GAS_LIMIT_MULTIPLIER = 3
// const NORMAL_FEE_MULTIPLER = 1.2
const AGGRESIVE_FEE_MULTIPLER = 2

export class Signor {
  provider: JsonRpcProvider
  devMode: boolean

  constructor(provider: JsonRpcProvider) {
    this.provider = provider
    this.devMode = process.env.MODE == 'development'
  }

  async sendTransaction(transaction: Transaction) {
    const signerUrl = getSignerUrl(transaction.chainId)
    if (!signerUrl) {
      throw new Error('Missing signer url')
    }

    transaction = await this.updateGasAndNonce(transaction)

    let res

    if (this.devMode) {
      // const priv = readKeyFromDevFile()
      // const wallet = new ethers.Wallet(priv, this.provider)
      this.impersonate(transaction.from)
      // transaction.from = wallet.address
      // transaction.nonce = await this.provider.getTransactionCount(wallet.address)
      // console.log('Rewrote transaction', transaction)

      const signer = await this.provider.getSigner(transaction.from)
      res = await signer.sendTransaction(transaction)
    } else {
      const response = await fetch(signerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_signTransaction',
          params: [transaction],
          id: +new Date(),
        }),
      })
      const signed = await response.json()

      if (signed.error) {
        throw new Error('Signer Error: ' + JSON.stringify(signed.error))
      }

      res = await this.provider.broadcastTransaction(signed.result)
    }
    this.mine()

    return res
  }

  private async mine() {
    if (this.devMode) {
      this.provider.send('anvil_mine', [])
    }
  }

  private async impersonate(address: string) {
    if (this.devMode) {
      console.log(`calling impersonate for '${address}'`)
      this.provider.send('anvil_setBalance', [address, '0x021e19e0c9bab2400000'])
      this.provider.send('anvil_impersonateAccount', [address])
    }
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
}

function getSignerUrl(chainId: string) {
  return (
    {
      '1': process.env.WEB3SIGNER_ETHEREUM_URL,
      '100': process.env.WEB3SIGNER_GNOSIS_URL,
    }[chainId] ?? ''
  )
}

// Only useful for dev, running web3signer locally
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readKeyFromDevFile() {
  // default to the first test key
  const defaultPK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

  try {
    const priv = YAML.parse(fs.readFileSync(process.cwd() + '/key.yaml', 'utf8')).privateKey
    return priv || defaultPK
  } catch (e) {
    return defaultPK
  }
}

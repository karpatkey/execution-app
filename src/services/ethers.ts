import { ethers } from 'ethers'
import { Blockchain } from 'src/config/strategies/manager'
import { chainId } from './executor/mapper'

export function getEthersProvider(blockchain: Blockchain, env: Record<string, string>) {
  const { mev } = {
    ethereum: {
      production: {
        mev: env.ETHEREUM_RPC_ENDPOINT_MEV,
      },
      development: {
        mev: env.LOCAL_FORK_URL,
      },
      test: {
        mev: '',
      },
    },
    gnosis: {
      production: {
        mev: env?.GNOSIS_RPC_ENDPOINT_MEV,
      },
      development: {
        mev: env.LOCAL_FORK_URL,
      },
      test: {
        mev: '',
      },
    },
  }[blockchain][(env.MODE || 'development') as 'development' | 'production' | 'test']

  const network = chainId(blockchain)
  const options = [network, { staticNetwork: true }] as [
    ethers.Networkish,
    ethers.JsonRpcApiProviderOptions,
  ]
  const provider = new ethers.JsonRpcProvider(mev, ...options)
  return provider
}

import { ethers } from 'ethers'
import { Blockchain } from 'src/config/strategies/manager'
import { chainId } from './executor/mapper'

export async function getEthersProvider(
  blockchain: Blockchain,
  env: Record<string, string>,
  useMev: boolean = true,
) {
  const { mev, normal, fallback } = {
    ethereum: {
      production: {
        mev: env.ETHEREUM_RPC_ENDPOINT_MEV,
        normal: env.ETHEREUM_RPC_ENDPOINT,
        fallback: env.ETHEREUM_RPC_ENDPOINT_FALLBACK,
      },
      development: {
        mev: env.LOCAL_FORK_URL + '?as=mev',
        normal: env.LOCAL_FORK_URL + '?as=normal',
        fallback: env.LOCAL_FORK_URL + '?as=fallback',
      },
      test: {
        mev: '',
        normal: '',
        fallback: '',
      },
    },
    gnosis: {
      production: {
        mev: env.GNOSIS_RPC_ENDPOINT_MEV,
        normal: env.GNOSIS_RPC_ENDPOINT,
        fallback: env.GNOSIS_RPC_ENDPOINT_FALLBACK,
      },
      development: {
        mev: env.LOCAL_FORK_URL + '?as=mev',
        normal: env.LOCAL_FORK_URL + '?as=normal',
        fallback: env.LOCAL_FORK_URL + '?as=fallback',
      },
      test: {
        mev: '',
        normal: '',
        fallback: '',
      },
    },
  }[blockchain][(env.MODE || 'development') as 'development' | 'production' | 'test']

  const network = chainId(blockchain)
  const options = [network, { staticNetwork: true }] as [
    ethers.Networkish,
    ethers.JsonRpcApiProviderOptions,
  ]

  const endpoints = [useMev && mev, normal, fallback].filter((e) => !!e) as string[]

  for (const endpoint of endpoints) {
    try {
      const prov = new ethers.JsonRpcProvider(endpoint, ...options)
      const block = await prov.getBlockNumber()
      console.log(`[axa-ethers] connected! block=${block} endpoint=${endpoint}`)
      return prov
    } catch (e) {
      // console.error(e)
      console.log(`[axa-ethers] connection failed! endpoint=${endpoint}`)
    }
  }

  throw new Error("Couldn't connect to any RPC")
}

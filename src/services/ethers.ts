import { ethers } from 'ethers'
import { chainId } from './executor/mapper'

import { Blockchain } from 'src/config/strategies/manager'

interface RPCEnv {
  mev_rpc_url?: string
  rpc_url?: string
  fallback_rpc_url?: string
}

export async function getEthersProvider(
  blockchain: Blockchain,
  env: RPCEnv,
  useMev: boolean = false,
) {
  const { mev, normal, fallback } = {
    production: {
      mev: env.mev_rpc_url,
      normal: env.rpc_url,
      fallback: env.fallback_rpc_url,
    },
    development: {
      mev: env.mev_rpc_url,
      normal: env.rpc_url,
      fallback: env.fallback_rpc_url,
    },
    test: {
      mev: '',
      normal: '',
      fallback: '',
    },
  }[(process.env.MODE || 'development') as 'development' | 'production' | 'test']

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

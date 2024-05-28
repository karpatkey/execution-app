import { useMutation, useQuery } from '@tanstack/react-query'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider } from 'ethers'
import { daoManagerRole } from 'src/config/constants'
import { Params as BuildParams } from 'src/pages/api/tx/build'
import { Params as CheckParams } from 'src/pages/api/tx/check'
import { Params as ExecuteParams } from 'src/pages/api/tx/execute'
import { Params as SimulateParams } from 'src/pages/api/tx/simulate'
import { chainId } from 'src/services/executor/mapper'

export { type BuildParams }

export type TxData = {
  transaction: any
  decoded_transactions: any
  tx_transactables: any
  error?: string
}

export type TxCheckData = {
  error?: string
}

export type TxSimulationData = {
  error?: string
}

export type ExecuteData = {
  status: number
  tx_hash: string
  error?: string
}

const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }

async function fetcher(path: string, body: any, signal: AbortSignal | undefined = undefined) {
  if (!body) return null
  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })
  const resBody = await res.json()
  if (!resBody || resBody.error) throw new Error(resBody.error || 'Error')
  return resBody
}

const TTL = 1 * 60 * 1000 // 1*60*1000 == 1 minutes

export function useTxBuild(params?: BuildParams, refresh: boolean = true) {
  const { address } = useWeb3ModalAccount()

  const p = params && { ...params, connectedWallet: address }
  return useQuery<TxData>({
    queryKey: ['tx/build/v1', btoa(JSON.stringify(p))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/build', p, signal),
    refetchInterval: refresh && TTL,
    gcTime: TTL,
    retry: false,
  })
}

export function useTxCheck(params?: CheckParams) {
  return useQuery<TxCheckData>({
    queryKey: ['tx/check/v1', btoa(JSON.stringify(params))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/check', params, signal),
  })
}

export function useTxSimulation(params?: SimulateParams) {
  return useQuery<TxSimulationData>({
    queryKey: ['tx/simulate/v1', btoa(JSON.stringify(params))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/simulate', params, signal),
  })
}

export function useExecute(key: any) {
  const { address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  return useMutation<ExecuteData, Error, ExecuteParams>({
    mutationFn: async (params: ExecuteParams) => {
      if (!params.dao || !params.blockchain) throw new Error('Missing params')
      const role = daoManagerRole(params.dao, params.blockchain, address)
      if (walletProvider && role) {
        const chain = chainId(params.blockchain)
        const ethersProvider = new BrowserProvider(walletProvider, chain)
        const signer = await ethersProvider.getSigner()
        const tx = await signer.sendTransaction(params.transaction)
        const receipt = await tx.wait()
        return { tx, receipt }
      } else {
        return await fetcher('/api/tx/execute', params)
      }
    },
    mutationKey: key,
  })
}

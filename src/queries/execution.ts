import { useMutation, useQuery } from '@tanstack/react-query'
import { Params as BuildParams } from 'src/pages/api/tx/build'
import { Params as CheckParams } from 'src/pages/api/tx/check'
import { Params as ExecuteParams } from 'src/pages/api/tx/execute'
import { Params as SimulateParams } from 'src/pages/api/tx/simulate'

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
  return useQuery<TxData>({
    queryKey: ['tx/build/v1', btoa(JSON.stringify(params))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/build', params, signal),
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
  return useMutation<ExecuteData, Error, ExecuteParams>({
    mutationFn: async (params: ExecuteParams) => {
      return await fetcher('/api/tx/execute', params)
    },
    mutationKey: key,
  })
}

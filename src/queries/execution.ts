import { useMutation, useQuery } from '@tanstack/react-query'

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

export type BuildParams = {
  dao: string
  blockchain: string
  protocol: string
  pool_id: string
  strategy: string
  percentage: any
  exit_arguments: any
}

export type CheckParams = {
  dao: string
  blockchain: string
  protocol: string
  tx_transactables: any
}

export type SimulateParams = { dao: string; blockchain: string; transaction: any }

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
  if (!resBody || resBody.error) throw new Error(resBody.error)
  return resBody
}

const TTL = 1 * 60 * 1000 // 1*60*1000 == 1 minutes

export function useTxBuild(params?: BuildParams) {
  return useQuery<TxData>({
    queryKey: ['tx/build/v1', btoa(JSON.stringify(params))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/build', params, signal),
    refetchInterval: TTL,
    gcTime: TTL * 2,
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

type ExecuteParams = {
  dao: string
  blockchain: string
  transaction: any
}

type ExecuteData = {
  status: number
  tx_hash: string
  error?: string
}

export function useExecute(params: ExecuteParams) {
  return useMutation<ExecuteData>({
    mutationFn: async () => {
      return await fetcher('/api/tx/execute', params)
    },
  })
}

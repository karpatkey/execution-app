import { useQuery } from '@tanstack/react-query'

type TxData = {
  decoded: any
}

type TxCheckData = {
  decoded: any
}

type TxSimulationData = {
  decoded: any
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
  if (!resBody || resBody.error) throw new Error(resBody.error)
  return resBody.data
}

export function useTxBuild(params?: Record<string, any>) {
  return useQuery<TxData>({
    queryKey: ['tx/build/v1', btoa(JSON.stringify(params))],
    refetchInterval: 1 * 60 * 1000, // 1*60*1000 == 1 minutes
    queryFn: async ({ signal }) => await fetcher('/api/tx/build', params, signal),
  })
}

export function useTxCheck(tx?: TxData) {
  return useQuery<TxCheckData>({
    queryKey: ['tx/check/v1', btoa(JSON.stringify(tx))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/check', tx, signal),
  })
}

export function useTxSimulation(tx?: TxData) {
  return useQuery<TxSimulationData>({
    queryKey: ['tx/simulate/v1', btoa(JSON.stringify(tx))],
    queryFn: async ({ signal }) => await fetcher('/api/tx/simulate', tx, signal),
  })
}

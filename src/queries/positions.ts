import { useUser } from '@auth0/nextjs-auth0/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Position } from 'src/contexts/state'
import { slug } from 'src/utils/string'

export function usePositions() {
  const { user } = useUser()

  return useQuery<Position[]>({
    queryKey: ['positions/v2', user?.sub],
    queryFn: async () => {
      if (!user) {
        return []
      }
      const res = await fetch('/api/positions')
      const body = await res.json()
      if (!body || body.error) {
        throw new Error(body.error)
      }
      return body.data
    },
  })
}

export function usePosition(dao: string, chain: string, pool_id: string) {
  const q = usePositions()
  const { data, error } = q

  const position = useMemo(() => {
    if (data && !error) {
      return findPosition(data ?? [], { dao, chain, pool_id })
    } else {
      return null
    }
  }, [data, error, dao, chain, pool_id])

  return useMemo(() => {
    return {
      ...q,
      error: error,
      data: position,
    }
  }, [q, error, position])
}

function findPosition(
  positions: Position[],
  { dao, chain, pool_id }: { dao: string; chain: string; pool_id: string },
): Position | null {
  return (
    positions.find(
      (position) =>
        slug(position.dao) == dao && position.blockchain == chain && position.pool_id == pool_id,
    ) || null
  )
}

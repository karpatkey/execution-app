import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import EmptyData from 'src/components/EmptyData'
import { useApp } from 'src/contexts/app.context'
import { PositionWithStrategies } from 'src/contexts/state'
import { usePositions } from 'src/queries/positions'
import { getStrategy } from 'src/services/strategies'
import { slug } from 'src/utils/string'
import { Modal } from 'src/views/Position/Modal/Modal'
import Card from 'src/views/Positions/Card'

export default function List() {
  const {
    state: { daosConfigs },
  } = useApp()
  const { data: positions } = usePositions()

  const searchParams = useSearchParams()
  const router = useRouter()

  const positionsWithStrategies: PositionWithStrategies[] = useMemo(() => {
    return (positions || []).map((position) => {
      const strategies = getStrategy(daosConfigs, position)
      return {
        ...position,
        strategies,
        isActive: !!strategies.positionConfig.find((s) => s.stresstest),
      }
    })
  }, [daosConfigs, positions])

  const filteredPositions = useMemo(() => {
    const queryTerms = (searchParams.get('query') || '')
      .toLowerCase()
      .split(' ')
      .filter((s) => s)
    const dao = searchParams.get('dao')

    const withDao =
      dao && dao != 'all'
        ? positionsWithStrategies.filter((position) => slug(position.dao) == dao)
        : positionsWithStrategies

    const sorter = (a: PositionWithStrategies, b: PositionWithStrategies) => {
      if (a.isActive && !b.isActive) return -1
      if (!a.isActive && b.isActive) return 1

      return b.usd_amount - a.usd_amount
    }

    if (queryTerms.length == 0) {
      return withDao.sort(sorter)
    } else {
      return withDao
        .filter((position) => {
          const joined = [position.dao, position.lptokenName, position.pool_id, position.protocol]
            .join(' ')
            .toLowerCase()
          return !queryTerms.find((t) => joined.search(t) == -1)
        })
        .sort(sorter)
    }
  }, [positionsWithStrategies, searchParams])

  const selectedPosition = useMemo(() => {
    const id = searchParams.get('position')
    if (id) {
      const [dao, blockchain, pool_id] = id.split(';')
      return filteredPositions.find(
        (pos) => pos.pool_id == pool_id && pos.blockchain == blockchain && slug(pos.dao) == dao,
      )
    }
  }, [filteredPositions, searchParams])

  const handleModalClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('position')

    const p = params.toString()
    const uri = p ? `${router.pathname}?${p}` : router.pathname
    router.push(uri, undefined, { shallow: true })
  }, [router, searchParams])

  if (!positionsWithStrategies) return <EmptyData />

  return (
    <>
      {selectedPosition ? (
        <Modal position={selectedPosition} open handleClose={handleModalClose} />
      ) : null}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px 20px',
        }}
      >
        {filteredPositions.map((position, index) => {
          return (
            <Box
              key={position.dao + index}
              sx={{
                width: '380px',
                minHeight: '140px',
                padding: '12px 12px',
                border: '1px solid #B6B6B6',
                background: 'background.paper',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              <Card id={index} key={index} position={position} />
            </Box>
          )
        })}
      </Box>
    </>
  )
}

import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import EmptyData from 'src/components/EmptyData'
import { useApp } from 'src/contexts/app.context'
import { PositionWithStrategies } from 'src/contexts/state'
import { usePositions } from 'src/queries/positions'
import { getStrategy } from 'src/utils/strategies'
import Card from 'src/views/Positions/Card'

const List = () => {
  const {
    state: { daosConfigs },
  } = useApp()
  const { data: positions } = usePositions()

  const searchParams = useSearchParams()

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
      dao && dao != 'All'
        ? positionsWithStrategies.filter((position) => position.dao == dao)
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
          const joined = [
            position.dao,
            position.lptokenName,
            position.pool_id,
            position.blockchain,
            position.protocol,
          ]
            .join(' ')
            .toLowerCase()
          return !queryTerms.find((t) => joined.search(t) == -1)
        })
        .sort(sorter)
    }
  }, [positionsWithStrategies, searchParams])

  if (!positionsWithStrategies) {
    return <EmptyData />
  }

  return (
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
            key={index}
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
  )
}

export default List

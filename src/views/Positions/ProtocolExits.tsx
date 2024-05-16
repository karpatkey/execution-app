import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useApp } from 'src/contexts/app.context'
import { PositionWithStrategies } from 'src/contexts/state'
import { usePositions } from 'src/queries/positions'
import { getStrategy } from 'src/services/strategies'
import { slug } from 'src/utils/string'
import ProtocolCard from './ProtocolCard'

export default function ProtocolExits() {
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

  const dao = searchParams.get('dao')
  const allDaos = 'all'
  const selectedDao = dao || allDaos

  const filteredPositions = useMemo(() => {
    const withDao =
      selectedDao == allDaos
        ? positionsWithStrategies
        : positionsWithStrategies.filter((position) => slug(position.dao) == selectedDao)

    return withDao
  }, [positionsWithStrategies, selectedDao])

  const protocols = useMemo(() => {
    return filteredPositions.reduce((acc: any, pos) => {
      if (pos.protocol == 'Wallet') return acc
      acc[pos.protocol] = acc[pos.protocol] || []
      if (pos.isActive) acc[pos.protocol].push(pos)
      return acc
    }, {})
  }, [filteredPositions])

  if (!filteredPositions || selectedDao == allDaos) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px 20px',
      }}
    >
      {Object.keys(protocols).map((protocol, index) => {
        const positions = protocols[protocol]
        if (positions.length == 0) return null

        return <ProtocolCard key={index} protocol={protocol} positions={positions} />
      })}
    </Box>
  )
}

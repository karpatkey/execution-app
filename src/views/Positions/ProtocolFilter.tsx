import { Box } from '@mui/material'
import { useMemo } from 'react'
import { PositionWithStrategies } from 'src/contexts/state'
import ProtocolCard from './ProtocolCard'

export default function ProtocolFilter({ positions }: { positions: PositionWithStrategies[] }) {
  const protocols = useMemo(() => {
    return positions.reduce((acc: any, pos) => {
      // if (pos.protocol == 'Wallet') return acc
      if (pos.isActive) {
        acc[pos.protocol] = acc[pos.protocol] || []
        acc[pos.protocol].push(pos)
      }
      return acc
    }, {})
  }, [positions])

  if (!positions) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px 20px',
      }}
    >
      {Object.keys(protocols)
        .sort()
        .map((protocol, index) => {
          const positions = protocols[protocol]

          return <ProtocolCard key={index} protocol={protocol} positions={positions} />
        })}
    </Box>
  )
}

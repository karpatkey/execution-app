import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { PositionWithStrategies } from 'src/contexts/state'
import ProtocolCard from './ProtocolCard'

export default function ProtocolFilter({ positions }: { positions: PositionWithStrategies[] }) {
  const searchParams = useSearchParams()

  const selected = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.get('protocol')
  }, [searchParams])

  const protocols = useMemo(() => {
    const prots = positions.reduce((acc: any, pos) => {
      // if (pos.protocol == 'Wallet') return acc
      if (pos.isActive) {
        acc[pos.protocol] = acc[pos.protocol] || []
        acc[pos.protocol].push(pos)
      }
      return acc
    }, {})

    if (selected) {
      prots[selected] = prots[selected] || []
    }

    return prots
  }, [positions, selected])

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

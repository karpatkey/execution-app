import { Box } from '@mui/material'
import { MouseEventHandler, useCallback } from 'react'
import Link from 'src/components/Link'
import { PositionWithStrategies } from 'src/contexts/state'
import { USD } from 'src/views/Positions/USD'
import ProtocolIcon from './ProtocolIcon'

function allCompatible(positions: PositionWithStrategies[]) {
  const chain = positions[0].blockchain
  const dao = positions[0].dao
  return !positions.find((p) => p.blockchain != chain || p.dao != dao)
}

export default function ProtocolCard({
  protocol,
  positions,
}: {
  protocol: string
  positions: PositionWithStrategies[]
}) {
  const totalUsd = positions.reduce((t, p) => p.usd_amount + t, 0)
  const noWayJose = 'noop'
  const url = allCompatible(positions) ? '/positions' : noWayJose

  const handleMissingFiltering = useCallback<MouseEventHandler>(
    (e) => {
      if (url == noWayJose) {
        e.preventDefault()
      }
    },
    [url, noWayJose],
  )
  return (
    <Link
      sx={{
        // width: '380px',
        // minHeight: '140px',
        padding: '12px 12px',
        border: '1px solid #B6B6B6',
        background: 'background.paper',
        borderRadius: '8px',
        display: 'flex',
        justify: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
      href={url}
      onClick={handleMissingFiltering}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '0.5em',
        }}
      >
        <ProtocolIcon protocol={protocol} /> <Box sx={{ marginLeft: '0.5em' }}>{protocol}</Box>
      </Box>
      <Box sx={{ marginBottom: '0.5em' }}>{positions.length} Positions</Box>
      <USD value={totalUsd} />
    </Link>
  )
}

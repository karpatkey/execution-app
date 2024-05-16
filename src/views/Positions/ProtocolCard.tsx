import { Box } from '@mui/material'
import Link from 'src/components/Link'
import { PositionWithStrategies } from 'src/contexts/state'
import { USD } from 'src/views/Positions/USD'
import ProtocolIcon from './ProtocolIcon'

export default function ProtocolCard({
  protocol,
  positions,
}: {
  protocol: string
  positions: PositionWithStrategies[]
}) {
  const totalUsd = positions.reduce((t, p) => p.usd_amount + t, 0)
  const url = '/positions'
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

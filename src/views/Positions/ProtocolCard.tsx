import { Box } from '@mui/material'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
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

  const searchParams = useSearchParams()
  const pathname = usePathname()

  const isSelected = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.get('protocol') == protocol
  }, [protocol, searchParams])

  const url = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('protocol') == protocol) {
      params.delete('protocol')
    } else {
      params.set('protocol', protocol)
    }
    const p = params.toString()
    const uri = p ? `${pathname}?${p}` : pathname
    return uri.toString()
  }, [pathname, searchParams, protocol])

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      <Link
        sx={{
          padding: '1.3em',
          border: isSelected ? '1px solid #333' : '1px solid #B6B6B6',
          background: isSelected ? '#fdfdfd' : 'background.paper',
          borderRadius: '2em',
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
    </Box>
  )
}

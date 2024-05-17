import { Box, Button } from '@mui/material'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Link from 'src/components/Link'
import { PositionWithStrategies } from 'src/contexts/state'
import { USD } from 'src/views/Positions/USD'
import ProtocolIcon from './ProtocolIcon'

const DEFAULT_STRATS = new Map([
  ['Aura', 'exit_2_1'],
  ['Balancer', 'exit_1_1'],
])

function stratId(p: PositionWithStrategies) {
  const strat = DEFAULT_STRATS.get(p.protocol) || 'noop'
  const config = p.strategies.positionConfig.find((c) => c.function_name == strat)
  if (!config) return false

  return config.function_name
}

function allCompatible(positions: PositionWithStrategies[]) {
  const chain = positions[0].blockchain
  const dao = positions[0].dao
  const strat = stratId(positions[0])

  return !positions.find(
    (p) => p.blockchain != chain || p.dao != dao || !stratId(p) || strat != stratId(p),
  )
}

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

  const isAllCompatible = useMemo(() => {
    return allCompatible(positions)
  }, [positions])

  const router = useRouter()
  const handleExitAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('position', 'all')

    const p = params.toString()
    const uri = p ? `${pathname}?${p}` : pathname
    router.push(uri, undefined, { shallow: true })
  }, [pathname, router, searchParams])

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
      {isAllCompatible ? (
        <Button
          color="error"
          disabled={!isSelected}
          size="small"
          variant="contained"
          onClick={handleExitAll}
          sx={{ marginTop: '1em' }}
        >
          Exit All
        </Button>
      ) : null}
    </Box>
  )
}

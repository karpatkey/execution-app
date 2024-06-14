import { Box, Button, Tooltip } from '@mui/material'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { PositionWithStrategies } from 'src/contexts/state'

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
  if (positions.length == 0) return false

  const chain = positions[0].blockchain
  const dao = positions[0].dao
  const strat = stratId(positions[0])

  return !positions.find(
    (p) => p.blockchain != chain || p.dao != dao || !stratId(p) || strat != stratId(p),
  )
}

export default function ExitAllButton({ positions }: { positions: PositionWithStrategies[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const isAllCompatible = useMemo(() => {
    return allCompatible(positions.filter((p) => p.isActive))
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
      <Tooltip title={!isAllCompatible ? 'change filters to enable' : null}>
        <span>
          <Button
            color="error"
            disabled={!isAllCompatible}
            size="medium"
            variant="contained"
            onClick={handleExitAll}
            sx={{ marginLeft: '2em' }}
          >
            Exit All
          </Button>
        </span>
      </Tooltip>
    </Box>
  )
}

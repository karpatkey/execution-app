import { Box, Divider, styled } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { PositionConfig } from 'src/config/strategies/manager'
import { useApp } from 'src/contexts/app.context'
import { Position } from 'src/contexts/state'
import { getStrategy } from 'src/services/strategies'
import ConfigurationForm from 'src/views/Position/Form/ConfigurationForm'
import StrategyForm from 'src/views/Position/Form/StrategyForm'
import NoStrategies from 'src/views/Position/NoStrategies'
import Primary from 'src/views/Position/Title/Primary'
import Secondary from 'src/views/Position/Title/Secondary'
import { Balances } from 'src/views/Positions/Balances'
import { USD } from 'src/views/Positions/USD'

const BoxWrapperRowStyled = styled(BoxWrapperColumn)(() => ({
  padding: '2rem',
  justifyContent: 'flex-start',
  borderBottom: '1px solid #B6B6B6',
}))

function isActive(strategy: PositionConfig, config: PositionConfig[]) {
  if (strategy.stresstest) return true
  const all = new Map(config.map((s) => [s.label.toLowerCase(), s.stresstest]))
  const recoveryModeSufix = ' (recovery mode)'
  const base = strategy.label.toLowerCase().replace(recoveryModeSufix, '')
  return all.get(base) || all.get(base + recoveryModeSufix) || false
}

function unique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index
}
function uniqueJoin(positions: Position[], key: keyof Position) {
  return positions
    .map((p) => p[key])
    .filter(unique)
    .join(', ')
}

const SIMPLE_INPUTS = new Set(['max_slippage'])

function isSimpleStrat(strategy: PositionConfig) {
  const inputs = strategy.parameters.filter((p) => p.type == 'input')
  return inputs.every((i) => SIMPLE_INPUTS.has(i.name))
}

export default function Detail({
  positions,
  onChange,
}: {
  positions: Position[]
  onChange: (params: any) => void
}) {
  const { state } = useApp()
  const { daosConfigs } = state

  const [selectedStrategy, setStrategy] = useState<string>()
  const onStrategyChange = useCallback(
    (st: any) => {
      setStrategy(st.strategy)
      onChange(null)
    },
    [setStrategy, onChange],
  )

  const dao = useMemo(() => uniqueJoin(positions, 'dao'), [positions])
  const blockchain = useMemo(() => uniqueJoin(positions, 'blockchain'), [positions])
  const protocol = useMemo(() => uniqueJoin(positions, 'protocol'), [positions])
  const lptokenName = useMemo(
    () =>
      positions.map((p, idx) => {
        return (
          <Box key={p.pool_id + idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ marginRight: '1rem' }}>{p.lptokenName}</Box>
          </Box>
        )
      }),
    [positions],
  )
  const usd_amount = useMemo(
    () => positions.reduce((total, p) => p.usd_amount + total, 0),
    [positions],
  )

  const allConfigs = useMemo(
    () => positions.map((p) => getStrategy(daosConfigs, p)),
    [daosConfigs, positions],
  )
  const { positionConfig, commonConfig } = allConfigs[0]
  const areAnyStrategies = positionConfig?.length > 0

  const strategies = useMemo(() => {
    return positionConfig.filter((strategy) => {
      const active = isActive(strategy, positionConfig)
      const allHaveIt =
        allConfigs.length == 1 ||
        allConfigs.every((c) => {
          const s = c.positionConfig.find((s) => s.function_name == strategy.function_name)
          return s?.stresstest
        })
      const simpleForMultiple = allConfigs.length == 1 || isSimpleStrat(strategy)

      return active && allHaveIt && simpleForMultiple
    })
  }, [allConfigs, positionConfig])

  const strategy = useMemo(
    () => strategies.find((s) => s.function_name == selectedStrategy),
    [selectedStrategy, strategies],
  )

  const onConfigChange = useCallback(
    (data: any) => {
      onChange({
        strategy: selectedStrategy,
        ...data,
      })
    },
    [onChange, selectedStrategy],
  )

  const onInvalid = useCallback(
    (errors: any) => {
      console.log(errors)
      onChange(null)
    },
    [onChange],
  )

  if (!positions || positions.length == 0) return null

  return (
    <BoxWrapperRowStyled gap={2}>
      <BoxWrapperColumn gap={1}>
        <BoxWrapperColumn gap={1}>
          <Primary title="Overview" />
          <Divider sx={{ borderBottomWidth: 5 }} />
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={1}>
          <Secondary title="DAO:" subtitle={dao} />
          <Secondary title="Blockchain:" subtitle={blockchain} />
          <Secondary title="Protocol:" subtitle={protocol} />
          <Secondary title="Position:" subtitle={lptokenName} />
          <Secondary title="USD Amount:">
            <USD value={usd_amount} />
          </Secondary>
        </BoxWrapperColumn>
        <Divider sx={{ borderBottomWidth: 5 }} />
        {positions.map((pos, idx) => (
          <Box key={pos.pool_id + 'tokens' + idx}>
            <Box
              sx={{
                paddingTop: '1.5rem',
                paddingBottom: '1rem',
                display: 'flex',
                fontWeight: '700',
                fontSize: '1.1rem',
                justifyContent: 'space-between',
              }}
            >
              <Box>{pos.lptokenName}</Box>
              <USD value={pos.usd_amount} />
            </Box>
            <Balances tokens={pos.tokens} />
          </Box>
        ))}
      </BoxWrapperColumn>
      <BoxWrapperColumn gap={1} sx={{ marginTop: '2rem' }}>
        {areAnyStrategies ? (
          <StrategyForm strategies={strategies} onValid={onStrategyChange} />
        ) : (
          <NoStrategies />
        )}
        {strategy ? (
          <ConfigurationForm
            key={selectedStrategy}
            // strategies={strategies}
            commonConfig={commonConfig}
            strategy={strategy}
            positions={positions}
            onSubmit={onConfigChange}
            onInvalid={onInvalid}
          />
        ) : null}
      </BoxWrapperColumn>
    </BoxWrapperRowStyled>
  )
}

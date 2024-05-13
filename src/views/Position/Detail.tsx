import { Divider, styled } from '@mui/material'
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

export default function Detail({
  position,
  onChange,
}: {
  position: Position
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

  const { positionConfig, commonConfig } = getStrategy(daosConfigs, position)
  const areAnyStrategies = positionConfig?.length > 0

  const strategies = useMemo(() => {
    return positionConfig.filter((strategy) => isActive(strategy, positionConfig))
  }, [positionConfig])

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

  if (!position) return null

  console.log('strategy', selectedStrategy)

  return (
    <BoxWrapperRowStyled gap={2}>
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={1}>
          <Primary title="Overview" />
          <Divider sx={{ borderBottomWidth: 5 }} />
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={2}>
          <Secondary title="DAO:" subtitle={position.dao} />
          <Secondary title="Blockchain:" subtitle={position.blockchain} />
          <Secondary title="Protocol:" subtitle={position.protocol} />
          <Secondary title="Position:" subtitle={position.lptokenName} />
          <Secondary title="USD Amount:">
            <USD value={position.usd_amount} />
          </Secondary>
        </BoxWrapperColumn>
        <Divider sx={{ borderBottomWidth: 5 }} />
        <Balances tokens={position.tokens} />
      </BoxWrapperColumn>
      <BoxWrapperColumn gap={2}>
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
            position={position}
            onValid={onConfigChange}
          />
        ) : null}
      </BoxWrapperColumn>
    </BoxWrapperRowStyled>
  )
}

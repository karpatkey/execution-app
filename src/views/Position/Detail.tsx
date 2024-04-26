import { Divider, styled } from '@mui/material'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { useApp } from 'src/contexts/app.context'
import { Position } from 'src/contexts/state'
import { getStrategy } from 'src/services/strategies'
import Form from 'src/views/Position/Form/Form'
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

export default function Detail({
  position,
  onChange,
}: {
  position: Position
  onChange: (params: any) => void
}) {
  const { state } = useApp()
  const { daosConfigs } = state

  if (!position) return null

  const { positionConfig } = getStrategy(daosConfigs, position)
  const areAnyStrategies = positionConfig?.length > 0

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
        {areAnyStrategies ? <Form position={position} onValid={onChange} /> : <NoStrategies />}
      </BoxWrapperColumn>
    </BoxWrapperRowStyled>
  )
}

import { BLOCKCHAIN, DAO, ExecConfig, getStrategyByPositionId } from 'src/config/strategies/manager'
import { Position } from 'src/contexts/state'

export const getStrategy = (position: Position) => {
  const { dao, position_id: positionId, protocol, blockchain } = position

  const config: ExecConfig = getStrategyByPositionId(
    dao as DAO,
    blockchain as unknown as BLOCKCHAIN,
    protocol,
    positionId
  )
  return config
}

import { ExecConfig, getStrategyByPositionId } from 'src/config/strategies/manager'
import { Position } from 'src/contexts/state'

export const getStrategy = (daosConfigs: any[], position: Position) => {
  const config: ExecConfig = getStrategyByPositionId(
    daosConfigs,
    position.dao,
    position.blockchain,
    position.pool_id,
    position.protocol,
  )
  return config
}

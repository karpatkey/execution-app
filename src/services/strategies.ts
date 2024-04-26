import { ExecConfig, getStrategyByPositionId } from 'src/config/strategies/manager'
import { Position } from 'src/contexts/state'

export const getStrategy = (daosConfigs: any[], position: Position) => {
  const { dao, pool_id, blockchain } = position

  const config: ExecConfig = getStrategyByPositionId(daosConfigs, dao, blockchain, pool_id)
  return config
}

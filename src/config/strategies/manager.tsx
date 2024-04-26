export type Dao =
  | 'Gnosis DAO'
  | 'Balancer DAO'
  | 'karpatkey DAO'
  | 'ENS DAO'
  | 'CoW DAO'
  | 'Gnosis Ltd'
  | 'Gnosis Guild'
  | 'TestSafeDAO'

export type Blockchain = 'gnosis' | 'ethereum'

export type ExecParameter =
  | 'dao'
  | 'protocol'
  | 'blockchain'
  | 'strategy'
  | 'percentage'
  | 'rewards_address'
  | 'max_slippage'
  | 'token_in_address'
  | 'token_out_address'
  | 'bpt_address'

export type Config = {
  name: ExecParameter
  label?: string
  type: 'input' | 'constant'
  value?: string
  rules?: {
    min?: number
    max?: number
  }
  options?: { label: string; value: string }[]
}

export type PositionConfig = {
  function_name: string
  label: string
  description: string
  parameters: Config[]
  stresstest?: boolean
}

export type ExecConfig = {
  commonConfig: Config[]
  positionConfig: PositionConfig[]
}

export const getStrategies = (mapper: any, dao: Dao, blockchain: Blockchain) => {
  const bc = blockchain.toLowerCase()
  const d = dao.toLowerCase()
  return mapper?.find(
    (daoMapper: any) => daoMapper.dao.toLowerCase() === d && daoMapper.blockchain === bc,
  )
}

export const getStrategyByPositionId = (
  daosConfigs: any,
  dao: Dao,
  blockchain: Blockchain,
  pool_id: string,
): ExecConfig => {
  const daoItem = getStrategies(daosConfigs, dao, blockchain)

  const position = daoItem?.positions?.find(
    (position: any) => position.position_id_tech.toLowerCase() === pool_id,
  )

  return {
    commonConfig: daoItem?.general_parameters ?? [],
    positionConfig: position?.exec_config ?? [],
  }
}

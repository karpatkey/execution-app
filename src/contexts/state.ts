import { Dao, ExecConfig } from 'src/config/strategies/manager'

export { type Dao }

export enum Status {
  Loading = 'Loading',
  Finished = 'Finished',
}

export type AppBlockchain = 'ethereum' | 'gnosis'

export type Token = {
  id: string
  symbol: string
  as: 'supply' | 'borrow' | 'reward' | 'other' | 'core'
  amount: number
  price: number
}

export type Position = {
  dao: Dao
  pool_id: string
  protocol: string
  blockchain: AppBlockchain
  lptoken_address: string
  lptokenName: string
  positionType?: string
  usd_amount: number
  updated_at: number
  tokens: Token[]
}

export type PositionWithStrategies = Position & {
  isActive: boolean
  strategies: ExecConfig
}

export type DBankInfo = {
  chain: string
  wallet: string
  protocol_name: string
  position: string
  pool_id: string
  position_type: string
  token_type: string
  symbol: string
  amount: number
  price: number
  datetime: number
}

export type Strategy = {
  id: string
  dao: Dao
  name: string
  pool_id: string
  description: string
  rewards_address: string
  max_slippage: number
  token_in_address: string
  token_in_address_label: string
  token_out_address: string
  token_out_address_label: string
  bpt_address: string
  percentage: number
  blockchain: AppBlockchain
  protocol: string
  position_name: string
}

export type TransactionBuild = {
  transaction: any
  decodedTransaction: any
}

export enum SetupItemStatus {
  NotDone = 'not done',
  Loading = 'loading',
  Failed = 'failed',
  Success = 'success',
}

export enum State {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum SetupStatus {
  Loading = 'loading',
  Create = 'create',
  TransactionBuild = 'transaction_build',
  TransactionCheck = 'transaction_check',
  Simulation = 'simulation',
  Confirm = 'confirm',
  Error = 'error',
}

export const initialState: InitialState = {
  daosConfigs: [],
  daos: [],
}

export type InitialState = {
  daosConfigs: any[]
  daos: Dao[]
}

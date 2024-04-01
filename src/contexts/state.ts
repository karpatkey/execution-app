import { ExecConfig } from 'src/config/strategies/manager'

export enum Status {
  Loading = 'Loading',
  Finished = 'Finished',
}

export type Token = {
  symbol: string
  as: 'supply' | 'borrow' | 'reward' | 'other' | 'core'
  amount: number
  price: number
  // updatedAt: number
}

export type Position = {
  dao: string
  pool_id: string
  protocol: string
  blockchain: string
  lptoken_address: string
  lptokenName: string
  positionType?: string
  usd_amount: number
  updated_at: number
  tokens?: Token[]
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
  dao: string
  name: string
  pool_id: string
  description: string
  rewards_address: Maybe<string>
  max_slippage: Maybe<number>
  token_out_address: Maybe<string>
  token_out_address_label: Maybe<string>
  bpt_address: Maybe<string>
  percentage: Maybe<number>
  blockchain: Maybe<string>
  protocol: Maybe<string>
  position_name: Maybe<string>
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
  status: Status.Loading,
  daosConfigs: [],
  daos: [],
  envNetworkData: null,
  setup: {
    status: SetupStatus.Loading,
    create: {
      value: null,
      status: SetupItemStatus.NotDone,
    },
    transactionBuild: {
      value: null,
      status: SetupItemStatus.NotDone,
    },
    transactionCheck: {
      value: null,
      status: SetupItemStatus.NotDone,
    },
    simulation: {
      value: null,
      status: SetupItemStatus.NotDone,
    },
    confirm: {
      value: null,
      status: SetupItemStatus.NotDone,
    },
  },
}

export type InitialState = {
  status: Status
  daosConfigs: any[]
  daos: string[]
  envNetworkData: Maybe<any>
  setup: {
    status: SetupStatus
    create: {
      value: Maybe<Strategy>
      status: SetupItemStatus
    }
    transactionBuild: {
      value: Maybe<TransactionBuild>
      status: SetupItemStatus
    }
    transactionCheck: {
      value: Maybe<boolean>
      status: SetupItemStatus
    }
    simulation: {
      value: Maybe<any>
      status: SetupItemStatus
    }
    confirm: {
      value: Maybe<any>
      status: SetupItemStatus
    }
  }
}

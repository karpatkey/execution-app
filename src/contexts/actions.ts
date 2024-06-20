import { Dao } from './state'

export enum ActionType {
  AddDAOs,
  AddDaosConfigs,
}

export interface AddDAOs {
  type: ActionType.AddDAOs
  payload: Dao[]
}

export interface AddDaosConfigs {
  type: ActionType.AddDaosConfigs
  payload: any[]
}

export type Actions = AddDAOs | AddDaosConfigs

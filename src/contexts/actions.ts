import { SetupItemStatus, SetupStatus, Status, Strategy, TransactionBuild } from './state'

export enum ActionType {
  UpdateStatus,
  AddDAOs,
  ClearDAOs,
  SetSetupCreate,
  SetSetupCreateStatus,
  SetSetupTransactionBuild,
  SetSetupTransactionBuildStatus,
  SetSetupTransactionCheck,
  SetSetupTransactionCheckStatus,
  SetSetupSimulation,
  SetSetupSimulationStatus,
  SetSetupConfirm,
  SetSetupConfirmStatus,
  SetSetupStatus,
  ClearSetup,
  ClearSetupWithoutCreate,
  UpdateEnvNetworkData,
  AddDaosConfigs,
}

export interface UpdateStatus {
  type: ActionType.UpdateStatus
  payload: Status
}

export interface AddDAOs {
  type: ActionType.AddDAOs
  payload: string[]
}

export interface ClearDAOs {
  type: ActionType.ClearDAOs
}

export interface SetSetupCreate {
  type: ActionType.SetSetupCreate
  payload: Strategy
}

export interface SetSetupCreateStatus {
  type: ActionType.SetSetupCreateStatus
  payload: SetupItemStatus
}

export interface SetSetupTransactionBuild {
  type: ActionType.SetSetupTransactionBuild
  payload: TransactionBuild
}

export interface SetSetupTransactionBuildStatus {
  type: ActionType.SetSetupTransactionBuildStatus
  payload: SetupItemStatus
}

export interface SetSetupTransactionCheck {
  type: ActionType.SetSetupTransactionCheck
  payload: boolean
}

export interface SetSetupTransactionCheckStatus {
  type: ActionType.SetSetupTransactionCheckStatus
  payload: SetupItemStatus
}

export interface SetSetupSimulation {
  type: ActionType.SetSetupSimulation
  payload: any
}

export interface SetSetupSimulationStatus {
  type: ActionType.SetSetupSimulationStatus
  payload: SetupItemStatus
}

export interface SetSetupConfirm {
  type: ActionType.SetSetupConfirm
  payload: any
}

export interface SetSetupConfirmStatus {
  type: ActionType.SetSetupConfirmStatus
  payload: SetupItemStatus
}

export interface SetSetupStatus {
  type: ActionType.SetSetupStatus
  payload: SetupStatus
}

export interface ClearSetup {
  type: ActionType.ClearSetup
}

export interface ClearSetupWithoutCreate {
  type: ActionType.ClearSetupWithoutCreate
}

export interface UpdateEnvNetworkData {
  type: ActionType.UpdateEnvNetworkData
  payload: any
}

export interface AddDaosConfigs {
  type: ActionType.AddDaosConfigs
  payload: any[]
}

export type Actions =
  | UpdateStatus
  | AddDAOs
  | ClearDAOs
  | SetSetupCreate
  | SetSetupCreateStatus
  | SetSetupTransactionBuild
  | SetSetupTransactionBuildStatus
  | SetSetupTransactionCheck
  | SetSetupTransactionCheckStatus
  | SetSetupSimulation
  | SetSetupSimulationStatus
  | SetSetupConfirm
  | SetSetupConfirmStatus
  | SetSetupStatus
  | ClearSetup
  | ClearSetupWithoutCreate
  | UpdateEnvNetworkData
  | AddDaosConfigs

import {
  ActionType,
  Actions,
  AddDAOs,
  AddDaosConfigs,
  ClearDAOs,
  ClearSetup,
  ClearSetupWithoutCreate,
  SetSetupConfirm,
  SetSetupConfirmStatus,
  SetSetupCreate,
  SetSetupCreateStatus,
  SetSetupSimulation,
  SetSetupSimulationStatus,
  SetSetupStatus,
  SetSetupTransactionBuild,
  SetSetupTransactionBuildStatus,
  SetSetupTransactionCheck,
  SetSetupTransactionCheckStatus,
  UpdateEnvNetworkData,
  UpdateStatus,
} from './actions'
import {
  InitialState,
  SetupItemStatus,
  SetupStatus,
  Status,
  Strategy,
  TransactionBuild,
} from './state'

export const mainReducer = (state: InitialState, action: Actions): InitialState => {
  switch (action.type) {
    case ActionType.AddDaosConfigs:
      return {
        ...state,
        daosConfigs: action.payload,
      }
    case ActionType.UpdateStatus:
      return {
        ...state,
        status: action.payload,
      }

    case ActionType.AddDAOs:
      if (!action.payload.includes('All') && action.payload.length > 1) {
        return {
          ...state,
          daos: ['All', ...action.payload],
        }
      } else if (action.payload.length === 1) {
        return {
          ...state,
          daos: action.payload,
        }
      }

    case ActionType.ClearDAOs:
      return {
        ...state,
        daos: [],
      }

    case ActionType.SetSetupCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            value: action.payload,
            status: SetupItemStatus.Success,
          },
        },
      }

    case ActionType.SetSetupCreateStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            ...state.setup.create,
            status: action.payload,
          },
        },
      }

    case ActionType.SetSetupTransactionBuild:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            value: action.payload,
            status: SetupItemStatus.Success,
          },
        },
      }

    case ActionType.SetSetupTransactionBuildStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            ...state.setup.transactionBuild,
            status: action.payload,
          },
        },
      }

    case ActionType.SetSetupTransactionCheck:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            value: action.payload,
            status: SetupItemStatus.Success,
          },
        },
      }

    case ActionType.SetSetupTransactionCheckStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            ...state.setup.transactionCheck,
            status: action.payload,
          },
        },
      }

    case ActionType.SetSetupSimulation:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            value: action.payload,
            status: SetupItemStatus.Success,
          },
        },
      }

    case ActionType.SetSetupSimulationStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            ...state.setup.simulation,
            status: action.payload,
          },
        },
      }

    case ActionType.SetSetupConfirm:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            value: action.payload,
            status: SetupItemStatus.Success,
          },
        },
      }

    case ActionType.SetSetupConfirmStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            ...state.setup.confirm,
            status: action.payload,
          },
        },
      }

    case ActionType.SetSetupStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          status: action.payload,
        },
      }

    case ActionType.ClearSetup:
      return {
        ...state,
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

    case ActionType.ClearSetupWithoutCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
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

    case ActionType.UpdateEnvNetworkData:
      return {
        ...state,
        envNetworkData: action.payload,
      }

    default:
      return state
  }
}

// Helper functions to simplify the caller
export const updateStatus = (status: Status): UpdateStatus => ({
  type: ActionType.UpdateStatus,
  payload: status,
})

export const addDaosConfigs = (configs: any[]): AddDaosConfigs => ({
  type: ActionType.AddDaosConfigs,
  payload: configs,
})

export const addDAOs = (daos: string[]): AddDAOs => ({
  type: ActionType.AddDAOs,
  payload: daos,
})

export const clearDAOs = (): ClearDAOs => ({
  type: ActionType.ClearDAOs,
})

export const setSetupCreate = (strategy: Strategy): SetSetupCreate => ({
  type: ActionType.SetSetupCreate,
  payload: strategy,
})

export const setSetupCreateStatus = (status: SetupItemStatus): SetSetupCreateStatus => ({
  type: ActionType.SetSetupCreateStatus,
  payload: status,
})

export const setSetupTransactionBuild = (
  transactionBuild: TransactionBuild,
): SetSetupTransactionBuild => ({
  type: ActionType.SetSetupTransactionBuild,
  payload: transactionBuild,
})

export const setSetupTransactionBuildStatus = (
  status: SetupItemStatus,
): SetSetupTransactionBuildStatus => ({
  type: ActionType.SetSetupTransactionBuildStatus,
  payload: status,
})

export const setSetupTransactionCheck = (transactionCheck: boolean): SetSetupTransactionCheck => ({
  type: ActionType.SetSetupTransactionCheck,
  payload: transactionCheck,
})

export const setSetupTransactionCheckStatus = (
  status: SetupItemStatus,
): SetSetupTransactionCheckStatus => ({
  type: ActionType.SetSetupTransactionCheckStatus,
  payload: status,
})

export const setSetupSimulation = (simulation: any): SetSetupSimulation => ({
  type: ActionType.SetSetupSimulation,
  payload: simulation,
})

export const setSetupSimulationStatus = (status: SetupItemStatus): SetSetupSimulationStatus => ({
  type: ActionType.SetSetupSimulationStatus,
  payload: status,
})

export const setSetupConfirm = (confirm: Maybe<{ txHash: any }>): SetSetupConfirm => ({
  type: ActionType.SetSetupConfirm,
  payload: confirm,
})

export const setSetupConfirmStatus = (status: SetupItemStatus): SetSetupConfirmStatus => ({
  type: ActionType.SetSetupConfirmStatus,
  payload: status,
})

export const setSetupStatus = (status: SetupStatus): SetSetupStatus => ({
  type: ActionType.SetSetupStatus,
  payload: status,
})

export const clearSetup = (): ClearSetup => ({
  type: ActionType.ClearSetup,
})

export const clearSetupWithoutCreate = (): ClearSetupWithoutCreate => ({
  type: ActionType.ClearSetupWithoutCreate,
})

export const updateEnvNetworkData = (data: any): UpdateEnvNetworkData => ({
  type: ActionType.UpdateEnvNetworkData,
  payload: data,
})

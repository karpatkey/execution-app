import {
  InitialState,
  Position,
  SetupItemStatus,
  SetupStatus,
  Status,
  Strategy,
  TransactionBuild
} from './state'
import {
  Actions,
  ActionType,
  AddDAOs,
  AddPositions,
  ClearDAOs,
  ClearPositions,
  ClearSearch,
  ClearSelectedDAO,
  ClearSelectedPosition,
  ClearSetup,
  ClearSetupWithoutCreate,
  SetSearch,
  SetSelectedDAO,
  SetSelectedPosition,
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
  UpdateStatus
} from './actions'

export const mainReducer = (state: InitialState, action: Actions): InitialState => {
  switch (action.type) {
    case ActionType.UpdateStatus:
      return {
        ...state,
        status: action.payload
      }
    case ActionType.AddPositions:
      return {
        ...state,
        positions: action.payload
      }
    case ActionType.ClearPositions:
      return {
        ...state,
        positions: []
      }
    case ActionType.SetSelectedPosition:
      return {
        ...state,
        selectedPosition: action.payload
      }
    case ActionType.ClearSelectedPosition:
      return {
        ...state,
        selectedPosition: null
      }
    case ActionType.AddDAOs:
      return {
        ...state,
        DAOs: action.payload
      }
    case ActionType.ClearDAOs:
      return {
        ...state,
        DAOs: []
      }
    case ActionType.SetSelectedDAO:
      // Filter positions by DAO
      const filteredPositionsByDAO = state.positions.filter((position: Position) => {
        return position?.dao?.toLowerCase() === action?.payload?.toLowerCase()
      })

      // Filter positions by search
      const filteredPositionsByDAOAndSearch = filteredPositionsByDAO.filter((position: Position) => {
        if(state?.search === null) return true
        return position?.lptoken_name?.toLowerCase()?.includes(state?.search?.toLowerCase()) ||
        position?.protocol?.toLowerCase()?.includes(state?.search?.toLowerCase()) ||
        position?.lptoken_address?.toLowerCase()?.includes(state?.search?.toLowerCase())
      })

      // Return state with selected DAO and filtered positions
      return {
        ...state,
        selectedDAO: action.payload,
        filteredPositions: filteredPositionsByDAOAndSearch
      }

    case ActionType.ClearSelectedDAO:
      return {
        ...state,
        selectedDAO: null
      }
    case ActionType.SetSearch:
      // Filter positions by search
      const filteredPositionsBySearch = state.positions.filter((position: Position) => {
        if(action?.payload === null) return true
        return position?.lptoken_name?.toLowerCase()?.includes(action?.payload?.toLowerCase()) ||
        position?.protocol?.toLowerCase()?.includes(action?.payload?.toLowerCase()) ||
        position?.lptoken_address?.toLowerCase()?.includes(action?.payload?.toLowerCase())
      })

      // If DAO is selected, filter positions by DAO
      if(state?.selectedDAO !== null) {
        const filteredPositionsByDAO = filteredPositionsBySearch.filter((position: Position) => {
          return position?.dao?.toLowerCase() === state?.selectedDAO?.toLowerCase()
        })
        return {
          ...state,
          search: action.payload,
          filteredPositions: filteredPositionsByDAO
        }
      }

      // Return state with search and filtered positions
      return {
        ...state,
        search: action.payload,
        filteredPositions: filteredPositionsBySearch
      }
    case ActionType.ClearSearch:
      return {
        ...state,
        search: null
      }
    case ActionType.SetSetupCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }
    case ActionType.SetSetupCreateStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            ...state.setup.create,
            status: action.payload
          }
        }
      }
    case ActionType.SetSetupTransactionBuild:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }
    case ActionType.SetSetupTransactionBuildStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            ...state.setup.transactionBuild,
            status: action.payload
          }
        }
      }
    case ActionType.SetSetupTransactionCheck:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }
    case ActionType.SetSetupTransactionCheckStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            ...state.setup.transactionCheck,
            status: action.payload
          }
        }
      }
    case ActionType.SetSetupSimulation:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }
    case ActionType.SetSetupSimulationStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            ...state.setup.simulation,
            status: action.payload
          }
        }
      }
    case ActionType.SetSetupConfirm:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }
    case ActionType.SetSetupConfirmStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            ...state.setup.confirm,
            status: action.payload
          }
        }
      }
    case ActionType.SetSetupStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          status: action.payload
        }
      }
    case ActionType.ClearSetup:
      return {
        ...state,
        setup: {
          status: SetupStatus.Loading,
          create: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          transactionBuild: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          transactionCheck: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          simulation: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          confirm: {
            value: null,
            status: SetupItemStatus.NotDone
          }
        }
      }
    case ActionType.ClearSetupWithoutCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          transactionCheck: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          simulation: {
            value: null,
            status: SetupItemStatus.NotDone
          },
          confirm: {
            value: null,
            status: SetupItemStatus.NotDone
          }
        }
      }
    case ActionType.UpdateEnvNetworkData:
      return {
        ...state,
        envNetworkData: action.payload
      }
    default:
      return state
  }
}

// Helper functions to simplify the caller
export const updateStatus = (status: Status): UpdateStatus => ({
  type: ActionType.UpdateStatus,
  payload: status
})

export const addPositions = (positions: Position[]): AddPositions => ({
  type: ActionType.AddPositions,
  payload: positions
})

export const clearPositions = (): ClearPositions => ({
  type: ActionType.ClearPositions
})

export const setSelectedPosition = (position: Position): SetSelectedPosition => ({
  type: ActionType.SetSelectedPosition,
  payload: position
})

export const clearSelectedPosition = (): ClearSelectedPosition => ({
  type: ActionType.ClearSelectedPosition
})

export const addDAOs = (DAOs: string[]): AddDAOs => ({
  type: ActionType.AddDAOs,
  payload: DAOs
})

export const clearDAOs = (): ClearDAOs => ({
  type: ActionType.ClearDAOs
})

export const setSelectedDAO = (DAO: string): SetSelectedDAO => ({
  type: ActionType.SetSelectedDAO,
  payload: DAO
})

export const clearSelectedDAO = (): ClearSelectedDAO => ({
  type: ActionType.ClearSelectedDAO
})

export const setSearch = (search: string): SetSearch => ({
  type: ActionType.SetSearch,
  payload: search
})

export const clearSearch = (): ClearSearch => ({
  type: ActionType.ClearSearch
})

export const setSetupCreate = (strategy: Strategy): SetSetupCreate => ({
  type: ActionType.SetSetupCreate,
  payload: strategy
})

export const setSetupCreateStatus = (status: SetupItemStatus): SetSetupCreateStatus => ({
  type: ActionType.SetSetupCreateStatus,
  payload: status
})

export const setSetupTransactionBuild = (
  transactionBuild: TransactionBuild
): SetSetupTransactionBuild => ({
  type: ActionType.SetSetupTransactionBuild,
  payload: transactionBuild
})

export const setSetupTransactionBuildStatus = (
  status: SetupItemStatus
): SetSetupTransactionBuildStatus => ({
  type: ActionType.SetSetupTransactionBuildStatus,
  payload: status
})

export const setSetupTransactionCheck = (transactionCheck: boolean): SetSetupTransactionCheck => ({
  type: ActionType.SetSetupTransactionCheck,
  payload: transactionCheck
})

export const setSetupTransactionCheckStatus = (
  status: SetupItemStatus
): SetSetupTransactionCheckStatus => ({
  type: ActionType.SetSetupTransactionCheckStatus,
  payload: status
})

export const setSetupSimulation = (simulation: any): SetSetupSimulation => ({
  type: ActionType.SetSetupSimulation,
  payload: simulation
})

export const setSetupSimulationStatus = (status: SetupItemStatus): SetSetupSimulationStatus => ({
  type: ActionType.SetSetupSimulationStatus,
  payload: status
})

export const setSetupConfirm = (confirm: Maybe<{ txHash: any }>): SetSetupConfirm => ({
  type: ActionType.SetSetupConfirm,
  payload: confirm
})

export const setSetupConfirmStatus = (status: SetupItemStatus): SetSetupConfirmStatus => ({
  type: ActionType.SetSetupConfirmStatus,
  payload: status
})

export const setSetupStatus = (status: SetupStatus): SetSetupStatus => ({
  type: ActionType.SetSetupStatus,
  payload: status
})

export const clearSetup = (): ClearSetup => ({
  type: ActionType.ClearSetup
})

export const clearSetupWithoutCreate = (): ClearSetupWithoutCreate => ({
  type: ActionType.ClearSetupWithoutCreate
})

export const updateEnvNetworkData = (data: any): UpdateEnvNetworkData => ({
  type: ActionType.UpdateEnvNetworkData,
  payload: data
})

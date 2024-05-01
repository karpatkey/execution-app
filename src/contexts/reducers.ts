import { ActionType, Actions, AddDAOs, AddDaosConfigs } from './actions'

import { Dao, InitialState } from './state'

export const mainReducer = (state: InitialState, action: Actions): InitialState => {
  switch (action.type) {
    case ActionType.AddDaosConfigs:
      return {
        ...state,
        daosConfigs: action.payload,
      }

    case ActionType.AddDAOs:
      return {
        ...state,
        daos: action.payload,
      }

    default:
      return state
  }
}

export const addDaosConfigs = (configs: any[]): AddDaosConfigs => ({
  type: ActionType.AddDaosConfigs,
  payload: configs,
})

export const addDAOs = (daos: Dao[]): AddDAOs => ({
  type: ActionType.AddDAOs,
  payload: daos,
})

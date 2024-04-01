import React, { createContext, useReducer } from 'react'
import { Actions } from './actions'
import { mainReducer } from './reducers'
import { InitialState, initialState } from './state'

const AppContext = createContext<{
  state: InitialState
  dispatch: React.Dispatch<Actions>
}>({
  state: initialState,
  dispatch: () => undefined,
})

interface AppProviderProps {
  children: React.ReactNode
}

const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(mainReducer, initialState, undefined)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

const useApp = () => {
  const context = React.useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { AppContext, AppProvider, useApp }

import { Control } from 'react-hook-form'

export interface InputProps {
  name: string
  control: Control
  label?: string
  setValue?: any
}

export type PossibleExecutionTypeValues = 'Simulate' | 'Execute'

export interface ExecutionType {
  name: PossibleExecutionTypeValues
}

import { InputAdornment, TextField } from '@mui/material'
import { TextFieldProps } from '@mui/material/TextField/TextField'
import React from 'react'
import { Controller } from 'react-hook-form'
import { InputProps } from './types'

export interface CustomInputPropsProps {
  label: string
  textFieldType?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  errors: any
  rules?: any
}

export type ControlledTextFieldProps = InputProps & TextFieldProps & CustomInputPropsProps

export const InputText = (props: ControlledTextFieldProps) => {
  const { name, defaultValue, control, textFieldType, errors, onChange, ...restProps } = props

  return (
    <Controller
      name={name as any}
      control={control}
      defaultValue={(defaultValue as any) ?? ''}
      render={({ field }) => (
        <TextField
          type={textFieldType}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) onChange(e)
            field.onChange(e)
          }}
          InputProps={{
            endAdornment: <InputAdornment position="start">%</InputAdornment>,
          }}
          value={field.value || ''}
          error={!!errors[field.name]}
          helperText={errors[field.name]?.message?.toString()}
          sx={{
            fontFamily: 'IBM Plex Sans',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '18px',
            color: 'custom.grey.dark',
            width: '100%',
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          }}
          {...restProps}
        />
      )}
    />
  )
}

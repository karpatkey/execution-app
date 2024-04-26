import { TextField } from '@mui/material'
import { TextFieldProps } from '@mui/material/TextField/TextField'
import { ForwardedRef, forwardRef } from 'react'
import { Controller } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { InputProps } from './types'

interface PercentageNumberFormatProps {
  inputRef: (instance: typeof NumericFormat | null) => void
  name: string
}

// eslint-disable-next-line react/display-name
const PercentageNumberFormat = forwardRef<PercentageNumberFormatProps, PercentageNumberFormatProps>(
  (props: PercentageNumberFormatProps, ref: ForwardedRef<PercentageNumberFormatProps>) => {
    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        allowNegative={false}
        valueIsNumericString
        decimalScale={3}
      />
    )
  },
)

export interface CustomInputPropsProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  errors: any
  rules?: any
  maxValue: number
  minValue: number
  defaultValue?: number
}

export type ControlledTextFieldProps = InputProps & TextFieldProps & CustomInputPropsProps

export const PercentageText = (props: ControlledTextFieldProps) => {
  const {
    name,
    rules,
    minValue = 0,
    maxValue = 100,
    defaultValue,
    control,
    errors,
    onChange,
    ...restProps
  } = props

  return (
    <Controller
      name={name as any}
      control={control}
      rules={rules}
      defaultValue={(defaultValue as any) ?? ''}
      render={({ field }) => {
        return (
          <TextField
            InputProps={{
              inputComponent: PercentageNumberFormat as any,
            }}
            inputProps={{
              value: field?.value,
              suffix: '%',
              isAllowed: (values: any) => {
                return (
                  (values.floatValue! >= minValue && values.floatValue! <= maxValue) ||
                  values.floatValue === undefined ||
                  values.floatValue === null
                )
              },
              onValueChange: (values: any) => {
                if (onChange) onChange(values)
                field.onChange(values.floatValue)
              },
            }}
            value={field?.value}
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
        )
      }}
    />
  )
}

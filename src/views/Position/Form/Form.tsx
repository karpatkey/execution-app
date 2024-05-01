import { Button } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { Control, SubmitHandler, useForm } from 'react-hook-form'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

import InfoIcon from '@mui/icons-material/Info'
import Tooltip from '@mui/material/Tooltip'
import { AmountsPreviewFromPercentage } from 'src/components/AmountsPreviewFromPercentage'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Config, PositionConfig } from 'src/config/strategies/manager'
import { useApp } from 'src/contexts/app.context'
import { Position } from 'src/contexts/state'
import { getStrategy } from 'src/services/strategies'
import { useDebounceCallback } from 'usehooks-ts'
import InputRadio from './InputRadio'
import { Label } from './Label'
import { PercentageText } from './PercentageText'
import { Title } from './Title'

interface CustomFormProps {
  position: Position
  onValid: (params: any) => void
}

type OptionsInputOption = {
  label: string
  value: string
}

type OptionsInputProps = {
  name: string
  label: string
  control: Control<any, any>
  options?: OptionsInputOption[]
}

import CryptoIcon from 'src/components/CryptoIcon'

const OptionsInput = ({ name, label, control, options }: OptionsInputProps) => {
  return (
    <BoxWrapperColumn gap={2}>
      <Label title={label} />
      <InputRadio
        name={name}
        control={control}
        options={
          options?.map((item) => {
            const sufix = name.startsWith('token_') ? (
              <CryptoIcon symbol={item.label} size={18} />
            ) : null
            return {
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {sufix} <span style={{ marginLeft: '0.5em' }}>{item.label ?? ''}</span>
                </span>
              ),
              value: item.value ?? '',
            }
          }) ?? []
        }
      />
    </BoxWrapperColumn>
  )
}

function isActive(strategy: PositionConfig, config: PositionConfig[]) {
  if (strategy.stresstest) return true
  const all = new Map(config.map((s) => [s.label.toLowerCase(), s.stresstest]))
  const recoveryModeSufix = ' (recovery mode)'
  const base = strategy.label.toLowerCase().replace(recoveryModeSufix, '')
  return all.get(base) || all.get(base + recoveryModeSufix) || false
}

type FormValues = {
  dao?: string
  blockchain?: string
  protocol?: string
  strategy?: string
  percentage?: number
  rewards_address?: string
  max_slippage?: number
  token_in_address?: string
  token_out_address?: string
  bpt_address?: string
}

type FormFieldConfig = {
  placeholder: string
}

const FORM_CONFIG: Record<keyof FormValues, FormFieldConfig> = {
  dao: { placeholder: 'Dao' },
  protocol: { placeholder: 'Protocol' },
  blockchain: { placeholder: 'Blockchain' },
  strategy: { placeholder: 'Strategy' },
  percentage: { placeholder: '0.00%' },
  rewards_address: { placeholder: '0x00000' },
  max_slippage: { placeholder: '0.00%' },
  token_in_address: { placeholder: '0x00000' },
  token_out_address: { placeholder: '0x00000' },
  bpt_address: { placeholder: '0x00000' },
}

function CustomForm({ position, onValid }: CustomFormProps) {
  const { state } = useApp()

  const { positionConfig: allStrategies, commonConfig } = getStrategy(state.daosConfigs, position)

  const strategies = useMemo(() => {
    return allStrategies.filter((strategy) => isActive(strategy, allStrategies))
  }, [allStrategies])

  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    control,
    setValue,
    clearErrors,
    watch,
    formState,
    register,
    unregister,
  } = useForm<FormValues>({
    // defaultValues,
    mode: 'onBlur',
  })

  console.log('isValid', isValid)

  console.log(formState)

  const watchStrategy = watch('strategy')
  // const watchMaxSlippage = watch('max_slippage')
  const watchPercentage = watch('percentage')
  const watchTokenOut = watch('token_out_address')

  const onSubmit: SubmitHandler<any> = useDebounceCallback(onValid, 300)

  const specificParameters: Config[] =
    strategies?.find((item) => item.function_name === watchStrategy)?.parameters ?? []

  const parameters = watchStrategy ? [...commonConfig, ...specificParameters] : []

  const isExecuteButtonDisabled = isSubmitting || !isValid
  console.log(isExecuteButtonDisabled)

  const handleStrategyChange = useCallback(() => {
    // Clear fields
    unregister('percentage')
    setValue('percentage', undefined)
    setValue('max_slippage', undefined)
    setValue('rewards_address', undefined)
    setValue('token_out_address', undefined)
    setValue('bpt_address', undefined)
    // setKeyIndex(keyIndex + 1)

    clearErrors('percentage')
    clearErrors('max_slippage')
    clearErrors('rewards_address')
    clearErrors('token_out_address')
    clearErrors('bpt_address')
  }, [clearErrors, setValue, unregister])

  console.log({ errors })

  return (
    <form id="hook-form" onChange={handleSubmit(onSubmit)}>
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={6}>
          <BoxWrapperColumn gap={2}>
            <Title title={'Exit strategies'} />
            <BoxWrapperColumn gap={2}>
              <InputRadio
                // {...register('strategy')}
                name="strategy"
                onChange={handleStrategyChange}
                options={strategies.map((item) => ({
                  label: item.label,
                  value: item.function_name.trim(),
                  description: item.description,
                }))}
                control={control}
              />
            </BoxWrapperColumn>
          </BoxWrapperColumn>
          {parameters.length == 0 ? (
            <input hidden {...register('percentage', { required: true })} />
          ) : null}

          {parameters.length > 0 ? (
            <BoxWrapperColumn gap={2}>
              <Title title={'Parameters'} />
              {parameters.map(({ name, label, type, rules, options }, index) => {
                if (type === 'constant') return null

                const { min, max } = rules || {}

                const onClickApplyMax = () => {
                  if (max !== undefined) setValue(name, max, { shouldValidate: true })
                }

                if (min !== undefined && max !== undefined) {
                  return (
                    <BoxWrapperColumn gap={2} key={index}>
                      <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                        <BoxWrapperRow gap={2}>
                          <Label title={label || ''} />
                          {name === 'max_slippage' ? (
                            <Tooltip
                              title={
                                <CustomTypography variant="body2" sx={{ color: 'common.white' }}>
                                  Please enter a slippage from {min}% to {max}%
                                </CustomTypography>
                              }
                              sx={{ ml: 1, cursor: 'pointer' }}
                            >
                              <InfoIcon sx={{ fontSize: 24, cursor: 'pointer' }} />
                            </Tooltip>
                          ) : null}
                        </BoxWrapperRow>

                        {name == 'percentage' ? (
                          <Button onClick={onClickApplyMax} variant="contained">
                            Max
                          </Button>
                        ) : null}
                      </BoxWrapperRow>
                      <PercentageText
                        name={name}
                        control={control}
                        rules={{
                          required: `Please enter a value between ${min}% and ${max}%`,
                          min,
                          max,
                        }}
                        placeholder={FORM_CONFIG[name].placeholder}
                        errors={errors}
                      />
                      {name == 'percentage' ? (
                        <AmountsPreviewFromPercentage
                          position={position}
                          percentage={watchPercentage}
                          tokenOut={watchTokenOut}
                        />
                      ) : null}
                    </BoxWrapperColumn>
                  )
                }

                if (options?.length ?? 0 > 0) {
                  return (
                    <OptionsInput
                      key={index}
                      name={name}
                      label={label || ''}
                      control={control}
                      options={options}
                    />
                  )
                }

                return null
              })}
            </BoxWrapperColumn>
          ) : null}
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    </form>
  )
}

const Form = memo(CustomForm)
export default Form

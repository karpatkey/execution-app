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
import { setSetupCreate, setSetupStatus } from 'src/contexts/reducers'
import { Position, SetupStatus, Strategy } from 'src/contexts/state'
import { getStrategy } from 'src/services/strategies'
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

const OptionsInput = ({ name, label, control, options }: OptionsInputProps) => {
  return (
    <BoxWrapperColumn gap={2}>
      <Label title={label} />
      <InputRadio
        name={name}
        control={control}
        options={
          options?.map((item) => {
            return {
              name: item.label ?? '',
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

function CustomForm({ position }: CustomFormProps) {
  const { dispatch, state } = useApp()

  const { positionConfig: allStrategies, commonConfig } = getStrategy(state.daosConfigs, position)

  const strategies = useMemo(() => {
    console.log('Filtering strategies')
    return allStrategies.filter((strategy) => isActive(strategy, allStrategies))
  }, [allStrategies])

  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    control,
    setValue,
    clearErrors,
    watch,
  } = useForm<FormValues>({
    // defaultValues,
    mode: 'all',
  })

  const watchStrategy = watch('strategy')
  // const watchMaxSlippage = watch('max_slippage')
  const watchPercentage = watch('percentage')

  const onSubmit: SubmitHandler<any> = useCallback(
    async (data: any) => {
      // Get label by value for the token_out_address in the positionConfig

      // First clear the stage just in case
      // dispatch(clearSetup())

      const findOptionLabel = (key: string) =>
        strategies
          .find((item) => item.function_name === data.strategy)
          ?.parameters.find((item) => item.name === key)
          ?.options?.find((item) => item.value === data[key])?.label ?? ''

      const tokenInAddressLabel = findOptionLabel('token_in_address')
      const tokenOutAddressLabel = findOptionLabel('token_out_address')

      const setup: Strategy = {
        id: data?.strategy,
        name: data?.strategy,
        dao: position.dao,
        pool_id: position.pool_id,
        blockchain: position.blockchain,
        protocol: position.protocol,
        description:
          strategies?.find((item) => item.function_name === data?.strategy)?.description ?? '',
        percentage: data?.percentage,
        position_name: position.lptokenName,
        rewards_address: data?.rewards_address,
        max_slippage: data?.max_slippage,
        token_in_address: data?.token_in_address,
        token_in_address_label: tokenInAddressLabel,
        token_out_address: data?.token_out_address,
        token_out_address_label: tokenOutAddressLabel,
        bpt_address: data?.bpt_address,
      }

      dispatch(setSetupCreate(setup))

      dispatch(setSetupStatus('create' as SetupStatus))
    },
    [strategies, dispatch, position],
  )

  const specificParameters: Config[] =
    strategies?.find((item) => item.function_name === watchStrategy)?.parameters ?? []

  const parameters = [...commonConfig, ...specificParameters]

  const isExecuteButtonDisabled = isSubmitting || !isValid
  console.log(isExecuteButtonDisabled)

  const handleStrategyChange = useCallback(() => {
    // Clear fields
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
  }, [clearErrors, setValue])

  return (
    <form id="hook-form" onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={6}>
          <BoxWrapperColumn gap={2}>
            <Title title={'Exit strategies'} />
            <BoxWrapperColumn gap={2}>
              <InputRadio
                name="strategy"
                onChange={handleStrategyChange}
                options={strategies.map((item) => ({
                  name: item.label,
                  value: item.function_name.trim(),
                  description: item.description,
                }))}
                control={control}
              />
            </BoxWrapperColumn>
          </BoxWrapperColumn>

          <BoxWrapperColumn gap={2}>
            <Title title={'Parameters'} />
            {parameters.map((parameter, index) => {
              const { name, label = '', type, rules, options } = parameter

              if (type === 'constant') return null

              let haveMinAndMaxRules = false

              const haveOptions = options?.length ?? 0 > 0
              const min = rules?.min

              const max = rules?.max
              haveMinAndMaxRules = min !== undefined && max !== undefined

              const onClickApplyMax = () => {
                if (max !== undefined) setValue(name, max, { shouldValidate: true })
              }

              if (haveMinAndMaxRules) {
                const isPercentageButton = name === 'percentage'

                return (
                  <BoxWrapperColumn gap={2} key={index}>
                    <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                      <BoxWrapperRow gap={2}>
                        <Label title={label} />
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

                      {isPercentageButton ? (
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
                        validate: {
                          required: (value: any) => {
                            if (!value || value === 0)
                              return `Please enter a value between ${min}% and ${max}%`
                          },
                        },
                      }}
                      minValue={0}
                      maxValue={max || 100}
                      placeholder={FORM_CONFIG[name].placeholder}
                      errors={errors}
                    />
                    {name == 'percentage' ? (
                      <AmountsPreviewFromPercentage
                        position={position}
                        percentage={watchPercentage}
                      />
                    ) : null}
                  </BoxWrapperColumn>
                )
              }

              if (haveOptions) {
                return (
                  <OptionsInput
                    key={index}
                    name={name}
                    label={label}
                    control={control}
                    options={options}
                  />
                )
              }

              return null
            })}
          </BoxWrapperColumn>
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    </form>
  )
}

const Form = memo(CustomForm)
export default Form

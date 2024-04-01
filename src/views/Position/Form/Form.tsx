import { Button } from '@mui/material'
import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

import InfoIcon from '@mui/icons-material/Info'
import Tooltip from '@mui/material/Tooltip'
import { AmountsPreviewFromPercentage } from 'src/components/AmountsPreviewFromPercentage'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import {
  Config,
  DEFAULT_VALUES_KEYS,
  DEFAULT_VALUES_TYPE,
  PARAMETERS_CONFIG,
  PositionConfig,
} from 'src/config/strategies/manager'
import { useApp } from 'src/contexts/app.context'
import { clearSetup, setSetupCreate, setSetupStatus } from 'src/contexts/reducers'
import { Position, SetupStatus, Strategy } from 'src/contexts/state'
import { getStrategy } from 'src/utils/strategies'
import { Modal } from '../Modal/Modal'
import InputRadio from './InputRadio'
import { Label } from './Label'
import { PercentageText } from './PercentageText'
import { Title } from './Title'

interface CustomFormProps {
  handleClickOpen: () => void
  position: Position
}

function isActive(strategy: PositionConfig, config: PositionConfig[]) {
  if (strategy.stresstest) return true
  const all = new Map(config.map((s) => [s.label.toLowerCase(), s.stresstest]))
  const recoveryModeSufix = ' (recovery mode)'
  const base = strategy.label.toLowerCase().replace(recoveryModeSufix, '')
  return all.get(base) || all.get(base + recoveryModeSufix) || false
}

const CustomForm = (props: CustomFormProps) => {
  const { handleClickOpen, position } = props

  const { dispatch, state } = useApp()
  const [keyIndex, setKeyIndex] = React.useState(1)

  const { positionConfig, commonConfig } = getStrategy(state.daosConfigs, position)

  // If we don't do this, the application will rerender every time
  const defaultValues: DEFAULT_VALUES_TYPE = React.useMemo(() => {
    return {
      blockchain: position?.blockchain ?? null,
      protocol: position?.protocol ?? null,
      strategy: positionConfig[0]?.function_name?.trim(),
      percentage: null,
      rewards_address: null,
      max_slippage: null,
      token_out_address: null,
      bpt_address: null,
    }
  }, [position, positionConfig])

  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    control,
    setError,
    setValue,
    clearErrors,
    watch,
  } = useForm<any>({
    defaultValues,
    mode: 'all',
  })

  const watchStrategy = watch('strategy')
  const watchMaxSlippage = watch('max_slippage')
  const watchPercentage = watch('percentage')

  // We need to do this, because the react hook form default values are not working properly
  React.useEffect(() => {
    if (defaultValues) {
      setValue('strategy', positionConfig[0]?.function_name ?? null)
      setValue('percentage', null)
      setValue('rewards_address', null)
      setValue('max_slippage', null)
      setValue('token_out_address', null)
      setValue('bpt_address', null)
    }
  }, [defaultValues, positionConfig, setValue])

  const onSubmit: SubmitHandler<any> = React.useCallback(
    async (data: any) => {
      // Get label by value for the token_out_address in the positionConfig

      // First clear the stage just in case
      dispatch(clearSetup())

      const tokenOutAddressLabel =
        positionConfig
          ?.find((item: PositionConfig) => item?.function_name === data?.strategy)
          ?.parameters?.find((item: Config) => item?.name === 'token_out_address')
          ?.options?.find((item: any) => item?.value === data?.token_out_address)?.label ?? ''

      const setup: Strategy = {
        id: data?.strategy,
        name: data?.strategy,
        dao: position.dao,
        pool_id: position.pool_id,
        blockchain: position.blockchain,
        protocol: position.protocol,
        description:
          positionConfig?.find((item: PositionConfig) => item.function_name === data?.strategy)
            ?.description ?? '',
        percentage: data?.percentage,
        position_name: position.lptokenName,
        rewards_address: data?.rewards_address,
        max_slippage: data?.max_slippage,
        token_out_address: data?.token_out_address,
        token_out_address_label: tokenOutAddressLabel,
        bpt_address: data?.bpt_address,
      }

      dispatch(setSetupCreate(setup))

      dispatch(setSetupStatus('create' as SetupStatus))
    },
    [positionConfig, dispatch, position],
  )

  const specificParameters: Config[] =
    (positionConfig as PositionConfig[])?.find(
      (item: PositionConfig) => item.function_name === watchStrategy,
    )?.parameters ?? []

  const parameters = [...commonConfig, ...specificParameters]

  const isExecuteButtonDisabled = isSubmitting || !isValid

  const handleStrategyChange = React.useCallback(() => {
    // Clear fields
    setValue('percentage', null)
    setValue('max_slippage', null)
    setValue('rewards_address', null)
    setValue('token_out_address', null)
    setValue('bpt_address', null)
    setKeyIndex(keyIndex + 1)

    clearErrors('percentage')
    clearErrors('max_slippage')
    clearErrors('rewards_address')
    clearErrors('token_out_address')
    clearErrors('bpt_address')
  }, [clearErrors, keyIndex, setValue])

  return (
    <form id="hook-form" onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={6}>
          <BoxWrapperColumn gap={2}>
            <Title title={'Exit strategies'} />
            <BoxWrapperColumn gap={2}>
              <InputRadio
                name={'strategy'}
                onChange={handleStrategyChange}
                options={positionConfig.map((item: PositionConfig) => {
                  return {
                    name: item.label,
                    value: item.function_name.trim(),
                    disabled: !isActive(item, positionConfig),
                    description: item.description,
                  }
                })}
                control={control}
              />
            </BoxWrapperColumn>
          </BoxWrapperColumn>

          <BoxWrapperColumn gap={2}>
            <Title title={'Parameters'} />
            {parameters.map((parameter: Config, index: number) => {
              const { name, label = '', type, rules, options } = parameter

              if (type === 'constant') {
                return null
              }

              let haveMinAndMaxRules = false
              let onChange = undefined

              const haveOptions = options?.length ?? 0 > 0
              const min = rules?.min

              const max = rules?.max
              haveMinAndMaxRules = min !== undefined && max !== undefined

              if ((name === 'percentage' || name === 'max_slippage') && type === 'input') {
                onChange = (values: any) => {
                  const value = values?.floatValue
                  if (!value) {
                    setError(name as any, {
                      type: 'manual',
                      message: `Please enter a value between ${min}% and ${max}%`,
                    })
                  } else {
                    clearErrors(label as any)
                  }
                }
              }

              const onClickApplyMax = () => {
                if (max !== undefined) {
                  clearErrors(name as any)
                  setValue(name as any, max, { shouldValidate: true })
                }
              }

              if (haveMinAndMaxRules) {
                const isMaxButtonDisabled =
                  name === 'percentage' ? watchPercentage == max : watchMaxSlippage == max

                const isPercentageButton = name === 'percentage'

                return (
                  <BoxWrapperColumn gap={2} key={`${index}_${keyIndex}`}>
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
                        <Button
                          disabled={isMaxButtonDisabled}
                          onClick={onClickApplyMax}
                          variant="contained"
                        >
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
                      placeholder={
                        PARAMETERS_CONFIG[name as DEFAULT_VALUES_KEYS].placeholder as string
                      }
                      errors={errors}
                      onChange={onChange}
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
                  <BoxWrapperColumn gap={2} key={index}>
                    <Label title={label} />
                    <InputRadio
                      name={name}
                      control={control}
                      options={
                        options?.map((item) => {
                          return {
                            name: item?.label ?? '',
                            value: item?.value ?? '',
                          }
                        }) ?? []
                      }
                    />
                  </BoxWrapperColumn>
                )
              }

              return null
            })}
          </BoxWrapperColumn>
        </BoxWrapperColumn>

        <Button
          onClick={handleClickOpen}
          variant="contained"
          size="large"
          sx={{ height: '60px', marginTop: '30px' }}
          disabled={isExecuteButtonDisabled}
          type={'submit'}
        >
          Submit
        </Button>
      </BoxWrapperColumn>
    </form>
  )
}

const CustomFormMemoized = React.memo(CustomForm)

const Form = ({ position }: { position: Position }) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = React.useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = React.useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <CustomFormMemoized position={position} handleClickOpen={handleClickOpen} />
      <Modal position={position} open={open} handleClose={handleClose} />
    </>
  )
}

export default Form

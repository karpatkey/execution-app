import { Button } from '@mui/material'
import { SubmitHandler, useForm } from 'react-hook-form'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

import InfoIcon from '@mui/icons-material/Info'
import Tooltip from '@mui/material/Tooltip'
import { AmountsPreviewFromPercentage } from 'src/components/AmountsPreviewFromPercentage'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Config, PositionConfig } from 'src/config/strategies/manager'
import { Position } from 'src/contexts/state'
import { useDebounceCallback } from 'usehooks-ts'
import { Label } from './Label'
import { OptionsInput } from './OptionsInput'
import { PercentageText } from './PercentageText'
import { Title } from './Title'

interface CustomFormProps {
  strategy: PositionConfig
  commonConfig: Config[]
  position: Position
  onValid: (params: any) => void
}

type FormValues = {
  // dao?: string
  // blockchain?: string
  // protocol?: string
  // strategy?: string
  percentage?: number
  rewards_address?: string
  max_slippage?: number
  token_in_address?: string
  token_out_address?: string
  bpt_address?: string
}

type FormFieldName = keyof FormValues

type FormFieldConfig = {
  placeholder: string
}

const FORM_CONFIG: Record<FormFieldName, FormFieldConfig> = {
  percentage: { placeholder: '0.00%' },
  rewards_address: { placeholder: '0x00000' },
  max_slippage: { placeholder: '0.00%' },
  token_in_address: { placeholder: '0x00000' },
  token_out_address: { placeholder: '0x00000' },
  bpt_address: { placeholder: '0x00000' },
}

export default function CustomForm({ commonConfig, strategy, position, onValid }: CustomFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    watch,
  } = useForm<FormValues>({
    mode: 'onBlur',
  })

  const watchPercentage = watch('percentage')
  const watchTokenOut = watch('token_out_address')

  const onSubmit: SubmitHandler<any> = useDebounceCallback(onValid, 300)

  const specificParameters = strategy?.parameters ?? []
  const parameters = [...commonConfig, ...specificParameters]

  return (
    <form id="hook-form" onChange={handleSubmit(onSubmit)}>
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={6}>
          {parameters.length > 0 ? (
            <BoxWrapperColumn gap={2}>
              <Title title={'Parameters'} />
              {parameters.map(({ name, label, type, rules, options }, index) => {
                if (type === 'constant') return null

                const { min, max } = rules || {}

                const onClickApplyMax = () => {
                  if (max !== undefined)
                    setValue(name as FormFieldName, max, { shouldValidate: true })
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
                        placeholder={FORM_CONFIG[name as FormFieldName].placeholder}
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

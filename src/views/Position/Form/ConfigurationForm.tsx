import { SubmitHandler, useForm } from 'react-hook-form'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

import InfoIcon from '@mui/icons-material/Info'
import Alert from '@mui/material/Alert'
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
  positions: Position[]
  onValid: (params: any) => void
}

type FormValues = {
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
  defaultValue?: string | number
}

const FORM_CONFIG: Record<FormFieldName, FormFieldConfig> = {
  percentage: { placeholder: '0.000%' },
  rewards_address: { placeholder: '0x00000' },
  max_slippage: { placeholder: '0.000%', defaultValue: 1 },
  token_in_address: { placeholder: '0x00000' },
  token_out_address: { placeholder: '0x00000' },
  bpt_address: { placeholder: '0x00000' },
}

export default function CustomForm({
  commonConfig,
  strategy,
  positions,
  onValid,
}: CustomFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    control,
    watch,
  } = useForm<FormValues>({
    mode: 'onBlur',
  })

  const watchPercentage = watch('percentage')
  const watchSlippage = watch('max_slippage')
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

                const config = FORM_CONFIG[name as FormFieldName]

                const { min, max } = rules || {}

                if (min !== undefined && max !== undefined) {
                  return (
                    <BoxWrapperColumn gap={2} key={index}>
                      <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                        <BoxWrapperRow gap={2}>
                          <Label title={label || ''} />
                          {name == 'max_slippage' ? (
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
                        {name == 'max_slippage' && watchSlippage && +watchSlippage > 10 ? (
                          <Alert severity="error">High slippage amount is selected</Alert>
                        ) : null}
                      </BoxWrapperRow>
                      <PercentageText
                        defaultValue={config.defaultValue ? +config.defaultValue : undefined}
                        name={name}
                        control={control}
                        rules={{
                          required: `Please enter a value between ${min}% and ${max}%`,
                          min,
                          max,
                        }}
                        placeholder={config.placeholder}
                        errors={errors}
                      />
                      {name == 'percentage' ? (
                        <AmountsPreviewFromPercentage
                          positions={positions}
                          percentage={watchPercentage}
                          tokenOut={undefined && watchTokenOut}
                        />
                      ) : null}
                    </BoxWrapperColumn>
                  )
                }

                if (options && options.length > 0) {
                  return (
                    <OptionsInput
                      key={index}
                      name={name}
                      defaultValue={options[0].value}
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

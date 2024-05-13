import { memo } from 'react'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

import { useForm } from 'react-hook-form'
import { PositionConfig } from 'src/config/strategies/manager'
import { useDebounceCallback } from 'usehooks-ts'
import InputRadio from './InputRadio'
import { Title } from './Title'

interface CustomFormProps {
  strategies: PositionConfig[]
  onValid: (params: any) => void
}

type FormValues = {
  strategy?: string
}

function CustomForm({ strategies, onValid }: CustomFormProps) {
  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    control,
  } = useForm<FormValues>({
    mode: 'onChange',
  })

  const onSubmit = useDebounceCallback(onValid, 100)

  const isExecuteButtonDisabled = isSubmitting || !isValid
  console.log(isExecuteButtonDisabled)

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
                options={strategies.map((item) => ({
                  label: item.label,
                  value: item.function_name.trim(),
                  description: item.description,
                }))}
                control={control}
              />
            </BoxWrapperColumn>
          </BoxWrapperColumn>
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    </form>
  )
}

const Form = memo(CustomForm)
export default Form

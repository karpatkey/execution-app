import { Control } from 'react-hook-form'
import CryptoIcon from 'src/components/CryptoIcon'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import InputRadio from './InputRadio'
import { Label } from './Label'

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

export const OptionsInput = ({ name, label, control, options }: OptionsInputProps) => {
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

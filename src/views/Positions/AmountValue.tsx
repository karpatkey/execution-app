import React from 'react'
import CustomTypography from 'src/components/CustomTypography'

interface Props {
  value: number
}

export const AmountValue = ({ value }: Props) => {
  const formattedValue = React.useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US')

    const amount = value > 10 ? Math.round(value) : value
    return formatter.format(amount)
  }, [value])

  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Mono',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '14px',
        color: 'custom.grey.dark',
        letterSpacing: '-0.02em',
        textAlign: 'end',
      }}
    >
      {formattedValue}
    </CustomTypography>
  )
}

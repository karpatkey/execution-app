import React from 'react'
import CustomTypography from 'src/components/CustomTypography'

interface USDProps {
  value: string
}

export const USD = ({ value }: USDProps) => {
  const formattedValue = React.useMemo(() => {
    const USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })

    return USDollar.format(+value)
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
        textAlign: 'end'
      }}
    >
      {formattedValue}
    </CustomTypography>
  )
}

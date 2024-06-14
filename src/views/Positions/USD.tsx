import React from 'react'
import CustomTypography from 'src/components/CustomTypography'

interface USDProps {
  value: number
}

export const USD = ({ value }: USDProps) => {
  const formattedValue = React.useMemo(() => {
    const USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value > 1 ? 0 : 2,
    })

    return USDollar.format(+value)
  }, [value])
  return <CustomTypography>{formattedValue}</CustomTypography>
}

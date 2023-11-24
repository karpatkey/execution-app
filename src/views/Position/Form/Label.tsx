import CustomTypography from 'src/components/CustomTypography'
import * as React from 'react'

interface FormLabelProps {
  title: string
}

export const Label = ({ title }: FormLabelProps) => {
  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Sans',
        fontStyle: 'normal',
        fontWeight: 500,
        fontSize: 18,
        lineHeight: '18px',
        color: 'custom.grey.dark'
      }}
    >
      {title}
    </CustomTypography>
  )
}

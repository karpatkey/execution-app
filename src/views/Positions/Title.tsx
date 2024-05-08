import { SxProps } from '@mui/material'
import CustomTypography from 'src/components/CustomTypography'

interface TitleProps {
  title: string
  sx?: SxProps
}

export const Title = ({ title, sx }: TitleProps) => {
  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Sans',
        fontStyle: 'normal',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        color: 'custom.grey.dark',
        wordBreak: 'break-word',
        ...(sx || {}),
      }}
    >
      {title}
    </CustomTypography>
  )
}

import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'

interface TitleSecondaryProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

const Secondary = ({ title, subtitle, children }: TitleSecondaryProps) => {
  return (
    <BoxWrapperRow gap={2} sx={{ justifyContent: 'flex-start' }}>
      <CustomTypography
        sx={{
          fontWeight: 500,
          fontFamily: 'IBM Plex Sans',
          fontStyle: 'normal',
          fontSize: 18,
          lineHeight: '18px',
          color: 'custom.grey.dark',
        }}
      >
        {title}
      </CustomTypography>
      {subtitle ? (
        <CustomTypography
          sx={{
            fontWeight: 700,
            fontFamily: 'IBM Plex Sans',
            fontStyle: 'normal',
            fontSize: 18,
            lineHeight: '18px',
            color: 'custom.grey.dark',
          }}
        >
          {subtitle || children}
        </CustomTypography>
      ) : null}
      {children ? children : null}
    </BoxWrapperRow>
  )
}

export default Secondary

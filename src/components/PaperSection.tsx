import * as React from 'react'
import CustomTypography from 'src/components/CustomTypography'
import Paper from 'src/components/Paper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'

interface PaperSectionProps {
  title?: string
  subTitle?: string
  children: React.ReactNode
}

const PaperSection = (props: PaperSectionProps) => {
  const { title, subTitle, children } = props
  return (
    <Paper sx={{ height: '100%' }}>
      <BoxWrapperColumn
        sx={{ marginX: '48px', marginY: '48px', height: '100%', alignItems: 'center' }}
        gap={5}
      >
        {title ? (
          <BoxWrapperRow gap={2} sx={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            <CustomTypography variant="paperSectionTitle" textAlign="left">
              {title}
            </CustomTypography>
          </BoxWrapperRow>
        ) : null}
        {subTitle ? (
          <BoxWrapperRow
            sx={{
              ...(subTitle ? { justifyContent: 'space-between' } : { justifyContent: 'flex-end' }),
            }}
          >
            {subTitle ? (
              <CustomTypography variant="paperSectionSubtitle">{subTitle}</CustomTypography>
            ) : null}
          </BoxWrapperRow>
        ) : null}
        {children}
      </BoxWrapperColumn>
    </Paper>
  )
}

export default PaperSection

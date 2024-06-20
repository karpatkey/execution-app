import ErrorIcon from '@mui/icons-material/Error'
import { Box, styled } from '@mui/material'
import { FC } from 'react'
import { FallbackProps } from 'react-error-boundary'
import CustomTypography from 'src/components/CustomTypography'
import Paper from 'src/components/Paper'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'

const GENERIC_ERROR_MESSAGE = 'Oops! Something went wrong'
const DESCRIPTION_ERROR_MESSAGE = 'This issue has been addressed to the team.'
const REFRESH_ERROR_MESSAGE = 'You may also refresh the page or try again later.'

const StyledPaper = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '32px',
  padding: '32px',
})

const ErrorFallback: FC<FallbackProps> = () => {
  return (
    <BoxContainerWrapper sx={{ padding: '32px 16px', display: 'flex', justifyContent: 'center' }}>
      <Box height="100%" display="flex" position="relative" alignItems="center">
        <StyledPaper sx={{ flexGrow: '1' }}>
          <ErrorIcon color="primary" sx={{ width: 60, height: 60 }} />
          <CustomTypography fontSize={40} fontWeight="extra-bold" textAlign="center">
            {GENERIC_ERROR_MESSAGE}
          </CustomTypography>
          <CustomTypography variant="h4" textAlign="center">
            {DESCRIPTION_ERROR_MESSAGE}
          </CustomTypography>
          <CustomTypography variant="h4" textAlign="center">
            {REFRESH_ERROR_MESSAGE}
          </CustomTypography>
        </StyledPaper>
      </Box>
    </BoxContainerWrapper>
  )
}

export default ErrorFallback

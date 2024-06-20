import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { SetupItemStatus } from 'src/contexts/state'

const WaitingSimulatingTransaction = () => {
  return (
    <Box sx={{ width: '100%', paddingTop: '16px', paddingBottom: '16px' }}>
      <CustomTypography variant={'subtitle1'} sx={{ color: 'black' }}>
        Simulating transaction
        <TextLoadingDots />
      </CustomTypography>
    </Box>
  )
}

function translateErrorMessage(error: Error | string | null) {
  if (typeof error == 'string') {
    return error
  } else if (
    error?.message &&
    typeof error?.message === 'string' &&
    error?.message != 'Failed to fetch'
  ) {
    return error.message
  } else {
    return 'Error trying to simulate transaction'
  }
}

type Props = {
  isLoading: boolean
  simulation?: any
  error?: Error | string | null
  onSimulate?: () => void
}

export function TransactionSimulation({ isLoading, simulation, error, onSimulate }: Props) {
  let status: SetupItemStatus = SetupItemStatus.NotDone

  if (simulation?.status == 200) status = SetupItemStatus.Success
  if (error) status = SetupItemStatus.Failed
  if (isLoading) status = SetupItemStatus.Loading

  const showSimulateButton = !isLoading && !simulation?.shareUrl

  if (status == SetupItemStatus.NotDone) return null

  return (
    <AccordionBoxWrapper
      gap={2}
      sx={{
        m: 3,
        backgroundColor: 'background.default',
      }}
    >
      <BoxWrapperColumn gap={4} sx={{ width: '100%', marginY: '14px', justifyContent: 'center' }}>
        <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
          <CustomTypography variant="body2">Simulation</CustomTypography>
          <StatusLabel status={status} />
        </BoxWrapperRow>
        <BoxWrapperRow
          sx={{
            justifyContent: error ? 'space-between' : 'flex-end',
          }}
          gap="20px"
        >
          {isLoading && <WaitingSimulatingTransaction />}
          {error && !isLoading && (
            <CustomTypography variant="body2" sx={{ color: 'red', justifyContent: 'left' }}>
              {translateErrorMessage(error)}
            </CustomTypography>
          )}
          {!isLoading && simulation?.share_url && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => window.open(simulation?.share_url, '_blank')}
            >
              View Tenderly simulation report
            </Button>
          )}

          {showSimulateButton && onSimulate && (
            <Button variant="contained" color="secondary" onClick={onSimulate}>
              Try again
            </Button>
          )}
        </BoxWrapperRow>
      </BoxWrapperColumn>
    </AccordionBoxWrapper>
  )
}

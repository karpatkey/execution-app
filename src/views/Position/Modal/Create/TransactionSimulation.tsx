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

  if (simulation) status = SetupItemStatus.Success
  if (error) status = SetupItemStatus.Failed
  if (isLoading) status = SetupItemStatus.Loading

  // const [error, setError] = useState<Error | null>(null)

  // const { blockchain, dao } = state?.setup?.create?.value ?? {}
  // const { transaction, decodedTransaction } = state?.setup?.transactionBuild?.value ?? {}
  // const transactionBuildStatus = state?.setup?.transactionBuild?.status ?? null
  // const simulationStatus = state?.setup?.simulation?.status ?? null
  // const shareUrl = state?.setup?.simulation?.value?.shareUrl ?? null
  // const simulationErrorMessage = state?.setup?.simulation?.value?.simulationErrorMessage ?? null

  // const isLoading = simulationStatus == 'loading'

  // const onSimulate = useCallback(async () => {
  //   try {
  //     if (isLoading) return
  //
  //     dispatch(setSetupSimulation(null))
  //     dispatch(setSetupStatus('simulation' as SetupStatus))
  //     dispatch(setSetupSimulationStatus('loading' as SetupItemStatus))
  //
  //     const parameters = {
  //       transaction: transaction,
  //       blockchain,
  //       dao,
  //     }
  //
  //     const response = await fetch('/api/tx/simulate', {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(parameters),
  //     })
  //
  //     const body = await response.json()
  //
  //     const { status, sim_data = {} } = body
  //
  //     if (status === 500) {
  //       const errorMessage =
  //         typeof body?.error === 'string' ? body?.error : 'Error trying to simulate the transaction'
  //       throw new Error(errorMessage)
  //     }
  //
  //     const { share_url: shareUrl, error_message: simulationErrorMessage } = sim_data ?? {}
  //
  //     if (shareUrl) {
  //       dispatch(setSetupSimulation({ shareUrl, simulationErrorMessage }))
  //       dispatch(
  //         setSetupSimulationStatus(
  //           !!simulationErrorMessage
  //             ? ('failed' as SetupItemStatus)
  //             : ('success' as SetupItemStatus),
  //         ),
  //       )
  //       dispatch(setSetupStatus('simulation' as SetupStatus))
  //       window.open(shareUrl, '_blank')
  //     } else {
  //       throw new Error('Error trying to simulate transaction')
  //     }
  //   } catch (err) {
  //     console.error('Error fetching data:', err)
  //     setError(err as Error)
  //     dispatch(setSetupSimulationStatus('failed' as SetupItemStatus))
  //   }
  // }, [isLoading, dispatch, transaction, blockchain, dao])

  // useEffect(() => {
  //   if (!isDisabled && simulationStatus === 'not done' && !isLoading) {
  //     onSimulate().then(() => console.log('Simulation finished'))
  //   }
  // }, [isDisabled, simulationStatus, isLoading, onSimulate])

  const showSimulateButton = !isLoading && !simulation?.shareUrl

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
          {!isLoading && simulation?.shareUrl && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => window.open(simulation?.shareUrl, '_blank')}
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

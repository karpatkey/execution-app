import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import * as React from 'react'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import { setSetupSimulation, setSetupSimulationStatus, setSetupStatus } from 'src/contexts/reducers'
import { SetupItemStatus, SetupStatus } from 'src/contexts/state'

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

export const Tenderly = () => {
  const { dispatch, state } = useApp()

  const [error, setError] = React.useState<Error | null>(null)

  const { blockchain, dao } = state?.setup?.create?.value ?? {}
  const { transaction, decodedTransaction } = state?.setup?.transactionBuild?.value ?? {}
  const transactionBuildStatus = state?.setup?.transactionBuild?.status ?? null
  const simulationStatus = state?.setup?.simulation?.status ?? null
  const shareUrl = state?.setup?.simulation?.value?.shareUrl ?? null
  const simulationErrorMessage = state?.setup?.simulation?.value?.simulationErrorMessage ?? null

  const isLoading = simulationStatus == 'loading'

  const isDisabled = React.useMemo(
    () =>
      !blockchain ||
      !dao ||
      !transaction ||
      !decodedTransaction ||
      transactionBuildStatus !== 'success',
    [blockchain, dao, transaction, decodedTransaction, transactionBuildStatus],
  )

  const onSimulate = React.useCallback(async () => {
    try {
      if (isLoading) return

      dispatch(setSetupSimulation(null))
      dispatch(setSetupStatus('simulation' as SetupStatus))
      dispatch(setSetupSimulationStatus('loading' as SetupItemStatus))

      const parameters = {
        execution_type: 'simulate',
        transaction: transaction,
        blockchain,
        dao,
      }

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      })

      const body = await response.json()

      const { status, data = {} } = body

      if (status === 500) {
        const errorMessage =
          typeof body?.error === 'string' ? body?.error : 'Error trying to simulate the transaction'
        throw new Error(errorMessage)
      }

      const { share_url: shareUrl, error_message: simulationErrorMessage } = data ?? {}

      if (shareUrl) {
        dispatch(setSetupSimulation({ shareUrl, simulationErrorMessage }))
        dispatch(
          setSetupSimulationStatus(
            !!simulationErrorMessage
              ? ('failed' as SetupItemStatus)
              : ('success' as SetupItemStatus),
          ),
        )
        dispatch(setSetupStatus('simulation' as SetupStatus))
        window.open(shareUrl, '_blank')
      } else {
        throw new Error('Error trying to simulate transaction')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err as Error)
      dispatch(setSetupSimulationStatus('failed' as SetupItemStatus))
    }
  }, [dispatch, transaction, blockchain, dao])

  React.useEffect(() => {
    if (!isDisabled && simulationStatus === 'not done' && !isLoading) {
      onSimulate().then(() => console.log('Simulation finished'))
    }
  }, [isDisabled, simulationStatus, isLoading, onSimulate])

  const showSimulateButton = !isLoading && !shareUrl && !isDisabled
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
          <StatusLabel status={simulationStatus} />
        </BoxWrapperRow>
        <BoxWrapperRow
          sx={{
            justifyContent:
              simulationStatus === ('failed' as SetupItemStatus) ? 'space-between' : 'flex-end',
          }}
          gap="20px"
        >
          {isLoading && <WaitingSimulatingTransaction />}
          {simulationStatus === ('failed' as SetupItemStatus) && !isLoading && (
            <CustomTypography variant="body2" sx={{ color: 'red', justifyContent: 'left' }}>
              {translateErrorMessage(simulationErrorMessage || error)}
            </CustomTypography>
          )}
          {shareUrl && !isLoading && (
            <Button
              variant="contained"
              size="small"
              onClick={() => window.open(shareUrl, '_blank')}
            >
              View Tenderly simulation report
            </Button>
          )}

          {showSimulateButton && (
            <Button variant="contained" size="small" onClick={onSimulate}>
              Try again
            </Button>
          )}
        </BoxWrapperRow>
      </BoxWrapperColumn>
    </AccordionBoxWrapper>
  )
}

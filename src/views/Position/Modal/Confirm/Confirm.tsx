import { Box, Link } from '@mui/material'
import Button from '@mui/material/Button'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Position, SetupItemStatus } from 'src/contexts/state'
import { TxCheckData, TxData, TxSimulationData } from 'src/queries/execution'

const WaitingExecutingTransaction = () => {
  return (
    <Box sx={{ width: '100%', paddingTop: '16px', paddingBottom: '16px' }}>
      <CustomTypography variant={'subtitle1'} sx={{ color: 'black' }}>
        Executing transaction
        <TextLoadingDots />
      </CustomTypography>
    </Box>
  )
}

interface ConfirmProps {
  position: Position
  tx: TxData
  txCheck: TxCheckData
  txSimulation: TxSimulationData
  handleClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Confirm = ({ position, tx, txCheck, txSimulation, handleClose }: ConfirmProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blockchain, dao } = position
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { transaction } = tx ?? {}

  // Get env network data

  const isDisabled = true

  // const onExecute = useCallback(async () => {
  //   try {
  //     const parameters = { transaction, blockchain, dao }
  //
  //     const response = await fetch('/api/tx/execute', {
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
  //     const { status } = body
  //
  //     // TODO, we need to check if the transaction was reverted or not in the development environment (fork blockchain)
  //   } catch (err) {
  //     console.error('Error fetching data:', err)
  //   }
  // }, [])

  const isLoading = true
  const confirmStatus = 'loading'
  const error = { message: '' }

  const txHash = ''

  return (
    <AccordionBoxWrapper
      gap={2}
      sx={{
        m: 3,
        backgroundColor: 'background.default',
      }}
    >
      <BoxWrapperColumn gap={4} sx={{ width: '100%', marginY: '14px', justifyContent: 'center' }}>
        <BoxWrapperColumn gap={2}>
          <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
            <CustomTypography variant={'body2'}>Confirmation</CustomTypography>
            {isLoading && <StatusLabel status={'loading' as SetupItemStatus} />}
          </BoxWrapperRow>
          {confirmStatus !== ('success' as SetupItemStatus) && !isLoading && (
            <CustomTypography variant={'subtitle1'}>
              You're about to create and confirm this transaction.
            </CustomTypography>
          )}
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={'20px'}>
          <BoxWrapperRow gap={'20px'}>
            {isLoading && <WaitingExecutingTransaction />}
            {confirmStatus === ('failed' as SetupItemStatus) && !isLoading && (
              <CustomTypography variant={'body2'} sx={{ color: 'red', overflow: 'auto' }}>
                {error?.message && typeof error?.message === 'string'
                  ? error?.message
                  : 'Error trying to execute transaction'}
              </CustomTypography>
            )}
            {txSimulation.error && (
              <CustomTypography variant={'body2'} sx={{ color: 'red', overflow: 'auto' }}>
                The transaction will most likely fail.Please double check the transaction details if
                you still want to execute it.
              </CustomTypography>
            )}
          </BoxWrapperRow>
          <BoxWrapperRow sx={{ justifyContent: 'flex-end' }} gap={'20px'}>
            {txHash && !isLoading && (
              <Button
                variant="contained"
                onClick={() => {
                  // open transaction hash in an explorer, if is ethereum in etherscan, if is gnosis in gnosisscan
                  const txUrl =
                    blockchain == 'ethereum'
                      ? `https://etherscan.io/tx/${txHash}`
                      : `https://gnosisscan.io/tx/${txHash}`
                  window.open(txUrl, '_blank')
                }}
              >
                View on block explorer
              </Button>
            )}
            {confirmStatus !== ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" color="error" onClick={() => handleClose()}>
                Cancel
              </Button>
            )}
            {confirmStatus !== ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" disabled={isDisabled}>
                Execute
              </Button>
            )}
            {confirmStatus === ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" component={Link} href={`/positions`}>
                Finish
              </Button>
            )}
          </BoxWrapperRow>
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    </AccordionBoxWrapper>
  )
}

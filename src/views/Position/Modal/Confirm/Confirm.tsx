import { Box, Link } from '@mui/material'
import Button from '@mui/material/Button'
import { TransactionReceipt, ethers } from 'ethers'
import * as React from 'react'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import { setSetupConfirm, setSetupConfirmStatus, setSetupStatus } from 'src/contexts/reducers'
import { SetupItemStatus, SetupStatus } from 'src/contexts/state'

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
  handleClose: () => void
}

export const Confirm = ({ handleClose }: ConfirmProps) => {
  const { dispatch, state } = useApp()

  const [error, setError] = React.useState<Error | null>(null)

  const { blockchain, dao } = state?.setup?.create?.value ?? {}
  const { transaction, decodedTransaction } = state?.setup?.transactionBuild?.value ?? {}
  const transactionBuildStatus = state?.setup?.transactionBuild?.status ?? null
  const transactionCheckStatus = state?.setup?.transactionCheck?.status ?? null
  const simulationStatus = state?.setup?.simulation?.status ?? null
  const confirmStatus = state?.setup?.confirm?.status ?? null
  const txHash = state?.setup?.confirm?.value?.txHash ?? null
  const isLoading = confirmStatus == 'loading'

  // Get env network data
  const ENV_NETWORK_DATA = state?.envNetworkData ?? {}

  const isDisabled = React.useMemo(
    () =>
      !dao ||
      !blockchain ||
      !transaction ||
      !decodedTransaction ||
      transactionBuildStatus !== 'success' ||
      transactionCheckStatus !== 'success' ||
      simulationStatus == 'loading' ||
      simulationStatus == 'not done',
    [
      blockchain,
      dao,
      transaction,
      decodedTransaction,
      transactionBuildStatus,
      transactionCheckStatus,
      simulationStatus,
    ],
  )

  const onExecute = React.useCallback(async () => {
    try {
      if (isDisabled) {
        throw new Error('Invalid transaction, please check the transaction and try again.')
      }

      dispatch(setSetupConfirm(null))
      dispatch(setSetupConfirmStatus('loading' as SetupItemStatus))
      dispatch(setSetupStatus('confirm' as SetupStatus))

      const parameters = {
        execution_type: 'execute',
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

      const { status } = body

      if (status === 500) {
        const errorMessage =
          typeof body?.error === 'string' ? body?.error : 'Error trying to execute the transaction'
        throw new Error(errorMessage)
      }

      const { tx_hash } = body?.data ?? {}

      if (!tx_hash) {
        throw new Error('Error trying to execute transaction')
      }

      // create custom rpc provider with ethers to wait for transaction
      const { MODE, ETHEREUM_RPC_ENDPOINT, GNOSIS_RPC_ENDPOINT } = ENV_NETWORK_DATA

      if (MODE === 'production') {
        const url = blockchain === 'Ethereum' ? ETHEREUM_RPC_ENDPOINT : GNOSIS_RPC_ENDPOINT

        const provider = new ethers.JsonRpcProvider(url)

        const receipt: Maybe<TransactionReceipt> = await provider.waitForTransaction(tx_hash)
        if (!receipt) {
          throw new Error('Transaction reverted')
        }

        const { hash, status } = receipt

        if (!status) {
          throw new Error('Transaction reverted')
        }

        if (!hash) {
          throw new Error('Error trying to execute transaction')
        }
      }

      // TODO, we need to check if the transaction was reverted or not in the development environment (fork blockchain)

      dispatch(setSetupConfirm({ txHash: tx_hash }))
      dispatch(setSetupConfirmStatus('success' as SetupItemStatus))
      dispatch(setSetupStatus('confirm' as SetupStatus))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err as Error)
      dispatch(setSetupConfirmStatus('failed' as SetupItemStatus))
    }
  }, [isDisabled, dispatch, transaction, blockchain, ENV_NETWORK_DATA])

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
            {simulationStatus === ('failed' as SetupItemStatus) && !isLoading && (
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
                size="small"
                onClick={() => {
                  // open transaction hash in an explorer, if is ethereum in etherscan, if is gnosis in gnosisscan
                  const txUrl =
                    blockchain === 'Ethereum'
                      ? `https://etherscan.io/tx/${txHash}`
                      : `https://gnosisscan.io/tx/${txHash}`
                  window.open(txUrl, '_blank')
                }}
              >
                View on block explorer
              </Button>
            )}
            {confirmStatus !== ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" size="small" onClick={() => handleClose()}>
                Cancel
              </Button>
            )}
            {confirmStatus !== ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" disabled={isDisabled} size="small" onClick={onExecute}>
                Execute
              </Button>
            )}
            {confirmStatus === ('success' as SetupItemStatus) && !isLoading && (
              <Button variant="contained" size="small" component={Link} href={`/positions`}>
                Finish
              </Button>
            )}
          </BoxWrapperRow>
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    </AccordionBoxWrapper>
  )
}

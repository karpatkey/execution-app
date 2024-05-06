import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import { useCallback } from 'react'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import Link from 'src/components/Link'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Position, SetupItemStatus } from 'src/contexts/state'
import { TxCheckData, TxData, TxSimulationData, useExecute } from 'src/queries/execution'

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
  const execute = useExecute()

  const onExecute = useCallback(async () => {
    execute.mutate({
      dao: position.dao,
      blockchain: position.blockchain,
      transaction: tx.transaction,
    })
  }, [execute, position.blockchain, position.dao, tx.transaction])

  const error = execute.error
  const txHash = execute.data?.tx_hash

  console.log(execute)

  const exploreUrl =
    position.blockchain == 'ethereum'
      ? `https://etherscan.io/tx/${txHash}`
      : `https://gnosisscan.io/tx/${txHash}`

  return (
    <AccordionBoxWrapper gap={2} sx={{ m: 3, backgroundColor: 'background.default' }}>
      <BoxWrapperColumn gap={4} sx={{ width: '100%', marginY: '14px', justifyContent: 'center' }}>
        <BoxWrapperColumn gap={2}>
          <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
            <CustomTypography variant={'body2'}>Confirmation</CustomTypography>
            {execute.isPending && <StatusLabel status={'loading' as SetupItemStatus} />}
          </BoxWrapperRow>
          {!execute.isPending && !execute.isError && !execute.data && (
            <CustomTypography variant={'subtitle1'}>
              You're about to create and confirm this transaction.
            </CustomTypography>
          )}
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={'20px'}>
          <BoxWrapperRow gap={'20px'}>
            {execute.isPending && <WaitingExecutingTransaction />}
            {execute.isError && !execute.isPending && (
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
            {txHash && (
              <Link href={exploreUrl} target="_blank">
                View on block explorer
              </Link>
            )}
            {!execute.isError && !execute.data && (
              <Button variant="contained" color="error" onClick={() => handleClose()}>
                Cancel
              </Button>
            )}
            {execute.isIdle && (
              <Button variant="contained" onClick={onExecute}>
                Execute
              </Button>
            )}
            {execute.data && !execute.isPending && (
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

import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import { UseMutationResult } from '@tanstack/react-query'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import Link from 'src/components/Link'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Position, SetupItemStatus } from 'src/contexts/state'
import { ExecuteData, TxCheckData, TxData, TxSimulationData } from 'src/queries/execution'

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
  execution?: UseMutationResult<ExecuteData, any, any, any>
  onExecute: () => void
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Confirm = ({
  position,
  txSimulation,
  execution,
  onExecute,
  onClose,
}: ConfirmProps) => {
  const error = execution?.error
  const txHash = execution?.data?.tx_hash

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
            {execution?.isPending && <StatusLabel status={'loading' as SetupItemStatus} />}
          </BoxWrapperRow>
          {!execution?.isPending && !execution?.isError && !execution?.data && (
            <CustomTypography variant={'subtitle1'}>
              You're about to create and confirm this transaction.
            </CustomTypography>
          )}
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={'20px'}>
          <BoxWrapperRow gap={'20px'}>
            {execution?.isPending && <WaitingExecutingTransaction />}
            {execution?.isError && !execution?.isPending && (
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
            {!execution?.isError && !execution?.data && !execution?.isPending && (
              <Button variant="contained" color="error" onClick={() => onClose()}>
                Cancel
              </Button>
            )}
            {execution?.isIdle && (
              <Button variant="contained" onClick={onExecute}>
                Execute
              </Button>
            )}
            {execution?.data && !execution?.isPending && (
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

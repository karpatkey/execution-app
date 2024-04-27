import InfoIcon from '@mui/icons-material/Info'
import Tooltip from '@mui/material/Tooltip'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { SetupItemStatus } from 'src/contexts/state'

type Props = {
  isLoading: boolean
  error?: Error | null
  check: any
}
export function TransactionCheck({ isLoading, error, check }: Props) {
  let status: SetupItemStatus = SetupItemStatus.NotDone

  if (check) status = SetupItemStatus.Success
  if (error) status = SetupItemStatus.Failed
  if (isLoading) status = SetupItemStatus.Loading

  if (status == SetupItemStatus.NotDone) return null
  console.log({ check })
  return (
    <AccordionBoxWrapper
      gap={2}
      sx={{
        m: 3,
        backgroundColor: 'background.default',
        justifyContent: 'space-between',
      }}
    >
      <BoxWrapperRow gap={1}>
        <CustomTypography variant={'body2'}>Transaction check</CustomTypography>
        <Tooltip
          title={
            <CustomTypography variant="body2" sx={{ color: 'common.white' }}>
              Perform a simulation using a local eth_call. If it is valid, it proceeds to decode the
              transaction. If not, it will return an error.
            </CustomTypography>
          }
          sx={{ ml: 1, cursor: 'pointer' }}
        >
          <InfoIcon sx={{ fontSize: 24, cursor: 'pointer' }} />
        </Tooltip>
      </BoxWrapperRow>
      <StatusLabel status={status} />
    </AccordionBoxWrapper>
  )
}

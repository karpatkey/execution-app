import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import { formatUnits } from 'ethers'
import { useMemo, useState } from 'react'
import { AccordionWrapper } from 'src/components/Accordion/AccordionWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { SetupItemStatus } from 'src/contexts/state'
import { shortenAddress } from 'src/utils/string'

const LABEL_MAPPER = {
  value: { label: 'Value', order: 1 },
  chainId: { label: 'Chain Id', order: 2 },
  gas: { label: 'Gas', order: 3 },
  maxFeePerGas: { label: 'Max fee per gas', order: 4 },
  maxPriorityFeePerGas: { label: 'Max priority fee per gas', order: 5 },
  nonce: { label: 'Nonce', order: 6 },
  to: { label: 'To', order: 7 },
  from: { label: 'From', order: 8 },
}

const WaitingDecodingTransaction = () => {
  return (
    <Box sx={{ width: '100%', paddingTop: '16px', paddingBottom: '16px' }}>
      <CustomTypography variant={'subtitle1'} sx={{ color: 'black' }}>
        Waiting for transaction building process
        <TextLoadingDots />
      </CustomTypography>
    </Box>
  )
}

type Props = {
  isLoading: boolean
  tx: any
  error?: Error | null
}

export function TransactionDetails({ isLoading, tx, error }: Props) {
  const [expanded, setExpanded] = useState(error ? 'panel1' : '')

  const parameters = useMemo(() => {
    if (!tx) return []
    const { transaction } = tx

    if (!transaction) return []

    return Object.keys(transaction)
      .map((key) => ({ key, label: LABEL_MAPPER[key as keyof typeof LABEL_MAPPER] }))
      .filter((o) => o.label)
      .sort((a, b) => a.label.order - b.label.order)
      .map((o) => ({
        key: o.key,
        label: o.label.label,
        value: transaction[o.key as keyof typeof transaction],
      }))
  }, [tx])

  const handleChange = (panel: any) => (_event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false)
  }

  let status: SetupItemStatus = SetupItemStatus.NotDone

  if (tx) status = SetupItemStatus.Success
  if (error) status = SetupItemStatus.Failed
  if (isLoading) status = SetupItemStatus.Loading

  if (status == SetupItemStatus.NotDone) return null

  return (
    <BoxWrapperRow gap={2} sx={{ m: 3, backgroundColor: 'custom.grey.light' }}>
      <AccordionWrapper
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
        sx={{ width: '100%' }}
      >
        <AccordionSummary
          expandIcon={isLoading ? <StatusLabel status={status} /> : <ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <BoxWrapperRow>
            <CustomTypography variant={'body2'}>Transaction details</CustomTypography>
          </BoxWrapperRow>
        </AccordionSummary>
        <AccordionDetails sx={{ justifyContent: 'flex-start', display: 'flex' }}>
          <Box sx={{ width: '100%' }} gap={2}>
            {isLoading && <WaitingDecodingTransaction />}
            {tx && parameters?.length > 0 && !isLoading && (
              <>
                <TableContainer sx={{ marginBottom: '30px' }}>
                  <Table sx={{ minWidth: 350 }}>
                    <TableBody>
                      {parameters.map(({ label, value, key }, index) => {
                        if (!value || !label) return null
                        let valueInGwei = null
                        const isGasKey =
                          key === 'gas' || key === 'maxFeePerGas' || key === 'maxPriorityFeePerGas'
                        if (isGasKey) {
                          valueInGwei = `${formatUnits(value, 'gwei')} gwei`
                        }

                        return (
                          <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {label}
                            </TableCell>
                            <TableCell align="right">
                              {key === 'to' || key === 'from' ? (
                                <BoxWrapperRow gap={1} sx={{ justifyContent: 'flex-end' }}>
                                  <CustomTypography variant={'body2'} title={value}>
                                    {shortenAddress(value)}
                                  </CustomTypography>
                                  <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => {
                                      navigator.clipboard.writeText(value)
                                    }}
                                  >
                                    <ContentCopyIcon
                                      sx={{
                                        cursor: 'pointer',
                                        width: '1rem',
                                        height: '1rem',
                                        color: 'black',
                                        ':hover': { color: 'grey', transition: '0.2s' },
                                      }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => {
                                      const url =
                                        tx?.transaction?.blockchain == 'ethereum'
                                          ? `https://etherscan.io/address/${value}`
                                          : `https://gnosisscan.io/address/${value}`
                                      window.open(url, '_blank')
                                    }}
                                  >
                                    <OpenInNewIcon
                                      sx={{
                                        cursor: 'pointer',
                                        width: '1rem',
                                        height: '1rem',
                                        color: 'black',
                                      }}
                                    />
                                  </IconButton>
                                </BoxWrapperRow>
                              ) : isGasKey ? (
                                valueInGwei
                              ) : (
                                value
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            {!isLoading && tx?.decoded_transaction && (
              <BoxWrapperColumn
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  fontSize: '0.8rem',
                }}
              >
                <CustomTypography variant={'body2'}>Decoded Transaction</CustomTypography>
                <Paper
                  variant="outlined"
                  square
                  sx={{
                    width: '-webkit-fill-available;',
                    overflow: 'auto',
                    maxHeight: '400px',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.9em',
                    lineHeight: '1.5em',
                    background: '#F5F5F5',
                  }}
                >
                  <pre>
                    <code>{JSON.stringify(tx?.decoded_transaction, null, 2)}</code>
                  </pre>
                </Paper>
              </BoxWrapperColumn>
            )}

            {error && !isLoading && (
              <BoxWrapperRow sx={{ justifyContent: 'flex-start' }}>
                <CustomTypography variant={'body2'} sx={{ color: 'red' }}>
                  {error?.message && typeof error?.message === 'string'
                    ? error?.message
                    : 'Error decoding transaction'}
                </CustomTypography>
              </BoxWrapperRow>
            )}
          </Box>
        </AccordionDetails>
      </AccordionWrapper>
    </BoxWrapperRow>
  )
}

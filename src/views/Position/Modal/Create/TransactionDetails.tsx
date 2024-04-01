import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  AccordionSummary,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import { formatUnits } from 'ethers'
import * as React from 'react'
import { AccordionWrapper } from 'src/components/Accordion/AccordionWrapper'
import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import TextLoadingDots from 'src/components/TextLoadingDots'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import {
  setSetupStatus,
  setSetupTransactionBuild,
  setSetupTransactionBuildStatus,
  setSetupTransactionCheck,
  setSetupTransactionCheckStatus,
} from 'src/contexts/reducers'
import { SetupItemStatus, SetupStatus, TransactionBuild } from 'src/contexts/state'
import { shortenAddress } from 'src/utils/string'

const LABEL_MAPPER = {
  value: {
    label: 'Value',
    order: 1,
  },
  chainId: {
    label: 'Chain Id',
    order: 2,
  },
  gas: {
    label: 'Gas',
    order: 3,
  },
  maxFeePerGas: {
    label: 'Max fee per gas',
    order: 4,
  },
  maxPriorityFeePerGas: {
    label: 'Max priority fee per gas',
    order: 5,
  },
  nonce: {
    label: 'Nonce',
    order: 6,
  },
  to: {
    label: 'To',
    order: 7,
  },
  from: {
    label: 'From',
    order: 8,
  },
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

export const TransactionDetails = () => {
  const { dispatch, state } = useApp()

  const transactionBuildValue = state?.setup?.transactionBuild?.value ?? null
  const transactionBuildStatus = state?.setup?.transactionBuild?.status ?? null
  const formValue = state?.setup?.create?.value ?? null

  const [error, setError] = React.useState<Maybe<Error>>(null)
  const [expanded, setExpanded] = React.useState('panel1')

  const isLoading = transactionBuildStatus == 'loading'

  React.useEffect(() => {
    if (!formValue || transactionBuildStatus !== 'not done' || isLoading) {
      console.log('Transaction details not executed')
      return
    }

    const {
      name: strategy,
      percentage,
      dao,
      position_name,
      pool_id,
      protocol,
      blockchain,
      bpt_address,
      max_slippage,
      rewards_address,
      token_out_address,
    } = formValue

    const parameters = {
      execution_type: 'transaction_builder',
      dao,
      pool_id,
      strategy,
      percentage,
      position_name,
      protocol,
      blockchain,
      exit_arguments: {
        bpt_address,
        max_slippage,
        rewards_address,
        token_out_address,
      },
    }

    const postData = async (data: any) => {
      try {
        dispatch(setSetupTransactionBuildStatus('loading' as SetupItemStatus))
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const body = await response.json()

        const { status, error: executeError } = body

        const { transaction, decoded_transaction: decodedTransaction } = body?.data ?? {}

        // check if response is 422
        if (status === 422) {
          // Allow to simulate, but not execute transaction
          const errorMessage =
            typeof body?.error === 'string' ? body?.error : 'Error decoding transaction'
          setError(new Error(errorMessage))

          dispatch(setSetupTransactionCheck(false))
          dispatch(setSetupTransactionCheckStatus('failed' as SetupItemStatus))
          dispatch(
            setSetupTransactionBuild({ transaction, decodedTransaction } as TransactionBuild),
          )
          dispatch(setSetupTransactionBuildStatus('success' as SetupItemStatus))
          dispatch(setSetupStatus('transaction_check' as SetupStatus))
        }

        if (status === 500 || response?.status === 401) {
          // Don't allow to simulate or execute transaction
          const errorMessage =
            typeof body?.error === 'string' ? body?.error : 'Error decoding transaction'
          setError(new Error(errorMessage))
          dispatch(setSetupTransactionCheck(false))
          dispatch(setSetupTransactionCheckStatus('failed' as SetupItemStatus))
          dispatch(
            setSetupTransactionBuild({ transaction, decodedTransaction } as TransactionBuild),
          )
          dispatch(setSetupTransactionBuildStatus('failed' as SetupItemStatus))
        }

        if (status === 200) {
          if (executeError) {
            setError(new Error(executeError))
            dispatch(setSetupTransactionCheck(false))
            dispatch(setSetupTransactionCheckStatus('failed' as SetupItemStatus))
            dispatch(setSetupTransactionBuildStatus('failed' as SetupItemStatus))
          } else {
            // Allow to simulate and execute transaction
            dispatch(setSetupTransactionCheck(true))
            dispatch(setSetupTransactionCheckStatus('success' as SetupItemStatus))
            dispatch(
              setSetupTransactionBuild({ transaction, decodedTransaction } as TransactionBuild),
            )
            dispatch(setSetupTransactionBuildStatus('success' as SetupItemStatus))
            dispatch(setSetupStatus('transaction_check' as SetupStatus))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error as Error)
        dispatch(setSetupTransactionCheckStatus('failed' as SetupItemStatus))
        dispatch(setSetupTransactionBuildStatus('failed' as SetupItemStatus))
      }
    }

    postData(parameters)
  }, [dispatch, formValue, isLoading, transactionBuildStatus])

  const parameters = React.useMemo(() => {
    if (!transactionBuildValue) return []
    const { transaction } = transactionBuildValue

    if (!transaction) return []

    return Object.keys(transaction)
      .filter((key) => LABEL_MAPPER[key as keyof typeof LABEL_MAPPER])
      .sort((a, b) => {
        return (
          LABEL_MAPPER[a as keyof typeof LABEL_MAPPER].order -
          LABEL_MAPPER[b as keyof typeof LABEL_MAPPER].order
        )
      })
      .map((key) => {
        return {
          key,
          label: LABEL_MAPPER[key as keyof typeof LABEL_MAPPER].label,
          value: transaction[key as keyof typeof transaction],
        }
      })
      .filter(({ value }) => value)
  }, [transactionBuildValue])

  const handleChange = (panel: any) => (_event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <BoxWrapperRow gap={2} sx={{ m: 3, backgroundColor: 'custom.grey.light' }}>
      <AccordionWrapper
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
        sx={{ width: '100%' }}
      >
        <AccordionSummary
          expandIcon={
            transactionBuildStatus == 'loading' ? (
              <StatusLabel status={transactionBuildStatus} />
            ) : (
              <ExpandMoreIcon />
            )
          }
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
            {transactionBuildValue && parameters?.length > 0 && !isLoading && (
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
                                        formValue?.blockchain === 'Ethereum'
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
            {transactionBuildValue && transactionBuildValue?.decodedTransaction && !isLoading && (
              <BoxWrapperColumn
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  fontSize: '0.8rem',
                }}
              >
                <CustomTypography variant={'body2'}>Decoded Transaction</CustomTypography>
                <Box
                  sx={{
                    width: '-webkit-fill-available;',
                    overflow: 'auto',
                    maxHeight: '400px',
                    padding: '16px',
                    marginTop: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <pre id="json">
                    <code>
                      {JSON.stringify(transactionBuildValue?.decodedTransaction, null, 2)}
                    </code>
                  </pre>
                </Box>
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

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  AccordionSummary,
  Alert,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import { AccordionWrapper } from 'src/components/Accordion/AccordionWrapper'
import { AmountsPreviewFromPercentage } from 'src/components/AmountsPreviewFromPercentage'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import { Position, Strategy } from 'src/contexts/state'
import { formatPercentage } from 'src/utils/format'
import { shortenAddress } from 'src/utils/string'

const LABEL_MAPPER = {
  description: {
    label: 'Strategy',
    order: 4,
  },
  blockchain: {
    label: 'Blockchain',
    order: 1,
  },
  protocol: {
    label: 'Protocol',
    order: 2,
  },
  position_name: {
    label: 'Position name',
    order: 3,
  },
  bpt_address: {
    label: 'BPT Address',
    order: 5,
  },
  percentage: {
    label: 'Percentage',
    order: 6,
  },
  max_slippage: {
    label: 'Max slippage',
    order: 7,
  },
  rewards_address: {
    label: 'Rewards address',
    order: 8,
  },
  token_out_address: {
    label: 'Token out address',
    order: 9,
  },
}

export const SetupDetails = ({ position }: { position: Position }) => {
  const { state } = useApp()

  const createValue = state?.setup?.create?.value || {}

  //filter value by LABEL_MAPPER and sort by order
  const parameters = createValue
    ? Object.keys(createValue)
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
            value: createValue && createValue[key as keyof typeof createValue],
          }
        })
        .filter(({ value }) => value)
    : []

  return (
    <BoxWrapperRow gap={2} sx={{ m: 3, backgroundColor: 'custom.grey.light' }}>
      <AccordionWrapper defaultExpanded sx={{ width: '100%' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <CustomTypography variant={'body2'}>Overview</CustomTypography>
        </AccordionSummary>
        <AccordionDetails sx={{ justifyContent: 'flex-start', display: 'flex' }}>
          <BoxWrapperColumn sx={{ width: '100%' }}>
            <TableContainer>
              <Table sx={{ minWidth: 350 }}>
                <TableBody>
                  {parameters.map(({ label, value, key }, index) => {
                    if (!value || !label) return null

                    let valueToDisplay: any = null
                    if (key === 'percentage') {
                      valueToDisplay = (
                        <>
                          <div>{formatPercentage(+value / 100)}</div>
                          <AmountsPreviewFromPercentage position={position} percentage={value} />
                        </>
                      )
                    } else if (key === 'max_slippage') {
                      valueToDisplay = formatPercentage(+value / 100)
                    } else if (key === 'token_out_address') {
                      valueToDisplay = (
                        <BoxWrapperColumn>
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
                                  createValue &&
                                  (createValue as Strategy)?.blockchain === 'Ethereum'
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
                          <CustomTypography variant={'body2'}>
                            {createValue['token_out_address_label' as keyof typeof createValue]}
                          </CustomTypography>
                        </BoxWrapperColumn>
                      )
                    } else {
                      valueToDisplay = value
                    }

                    return (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ display: 'flex', justifyContent: 'flex-start' }}
                        >
                          {label}
                        </TableCell>
                        <TableCell align="right">
                          <BoxWrapperColumn gap={2}>
                            <Box>{valueToDisplay}</Box>
                            {key === 'max_slippage' && +value > 10 ? (
                              <Alert severity="warning">High slippage amount is selected</Alert>
                            ) : null}
                          </BoxWrapperColumn>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </BoxWrapperColumn>
        </AccordionDetails>
      </AccordionWrapper>
    </BoxWrapperRow>
  )
}

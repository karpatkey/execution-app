import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import {
  AccordionSummary, Alert, Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CustomTypography from 'src/components/CustomTypography'
import AccordionDetails from '@mui/material/AccordionDetails'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import {formatPercentage} from 'src/utils/format'
import * as React from 'react'
import {AccordionWrapper} from 'src/components/Accordion/AccordionWrapper'
import {useApp} from 'src/contexts/app.context'
import {shortenAddress} from "src/utils/string";

const LABEL_MAPPER = {
  description: {
    label: 'Strategy',
    order: 4
  },
  blockchain: {
    label: 'Blockchain',
    order: 1
  },
  protocol: {
    label: 'Protocol',
    order: 2
  },
  position_name: {
    label: 'Position name',
    order: 3
  },
  bpt_address: {
    label: 'BPT Address',
    order: 5
  },
  percentage: {
    label: 'Percentage',
    order: 6
  },
  max_slippage: {
    label: 'Max slippage',
    order: 7
  },
  rewards_address: {
    label: 'Rewards address',
    order: 8
  },
  token_out_address: {
    label: 'Token out address',
    order: 9
  }
}

export const SetupDetails = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {dispatch, state} = useApp()

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
          value: createValue && createValue[key as keyof typeof createValue]
        }
      })
      .filter(({value}) => value)
    : []

  return (
    <BoxWrapperRow gap={2} sx={{m: 3, backgroundColor: 'custom.grey.light'}}>
      <AccordionWrapper sx={{width: '100%'}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon/>}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <CustomTypography variant={'body2'}>Overview</CustomTypography>
        </AccordionSummary>
        <AccordionDetails sx={{justifyContent: 'flex-start', display: 'flex'}}>
          <BoxWrapperColumn sx={{width: '100%'}}>
            <TableContainer>
              <Table sx={{minWidth: 350}}>
                <TableBody>
                  {parameters.map(({label, value, key}, index) => {
                    if (!value || !label) return null

                    let valueToDisplay = null
                    if (key === 'percentage' || key === 'max_slippage') {
                      valueToDisplay = formatPercentage(+value / 100)
                    } else if (key === 'token_out_address') {
                      valueToDisplay = (
                        <BoxWrapperColumn>
                          <span title={value}>{shortenAddress(value)}</span>
                          <span>{createValue['token_out_address_label']}</span>
                        </BoxWrapperColumn>
                      )
                    } else {
                      valueToDisplay = value
                    }

                    return (
                      <TableRow
                        key={index}
                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                      >
                        <TableCell component="th" scope="row" sx={{display: 'flex', justifyContent: 'flex-start'}}>
                          {label}
                        </TableCell>
                        <TableCell align="right">
                          <BoxWrapperColumn gap={2}>
                            <Box>{valueToDisplay}</Box>
                            {key === 'max_slippage' && +value > 10 ?
                              <Alert severity="warning">High slippage amount is selected</Alert> : null}
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

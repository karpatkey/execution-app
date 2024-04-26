import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useCallback, useState } from 'react'
import CustomTypography from 'src/components/CustomTypography'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Position } from 'src/contexts/state'
import Detail from '../Detail'
import { Confirm } from './Confirm/Confirm'
import { TransactionCheck } from './Create/TransactionCheck'
import { TransactionDetails } from './Create/TransactionDetails'
import { TransactionSimulation } from './Create/TransactionSimulation'
import { Stepper } from './Stepper'

import { useTxBuild, useTxCheck, useTxSimulation } from 'src/queries/execution'

interface ModalProps {
  open: boolean
  position: Position
  handleClose: () => void
}

const BoxWrapper = styled(Box)(() => ({
  backgroundColor: 'white',
  borderRadius: '8px',
}))

const BoxWrapperRowStyled = styled(BoxWrapperRow)(() => ({
  justifyContent: 'flex-start',
  borderBottom: '1px solid #B6B6B6',
}))

export const Modal = (props: ModalProps) => {
  const { position, open, handleClose } = props

  let hiddenStepper = useMediaQuery((theme: any) => theme.breakpoints.down('md'))
  hiddenStepper = true
  const smallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

  const [params, setParams] = useState(undefined)

  const handleParamsChange = useCallback((params: any) => {
    setParams(params)
  }, [])

  const { data: tx, isLoading: isBuilding, error: buildError } = useTxBuild(params)
  const { data: txCheck, isLoading: isChecking, error: checkError } = useTxCheck(tx)
  const {
    data: txSimulation,
    isLoading: isSimulating,
    error: simulationError,
  } = useTxSimulation(tx)

  const stepperWidth = '280px'

  const modalPadding = smallScreen ? '1rem' : '3rem'
  return (
    <Dialog
      fullScreen={false}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        backgroundColor: 'custom.grey.light',
      }}
    >
      <BoxContainerWrapper sx={{}}>
        <BoxWrapperRow sx={{ padding: '1rem', justifyContent: 'space-between' }}>
          <Box />
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </BoxWrapperRow>

        <BoxWrapperColumn sx={{ paddingRight: modalPadding, paddingLeft: modalPadding }} gap={2}>
          <BoxWrapperRowStyled gap={2}>
            <CustomTypography variant="h6">Strategy execution</CustomTypography>
          </BoxWrapperRowStyled>
          <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between', alignItems: 'self-start' }}>
            <BoxWrapperColumn
              sx={{
                width: hiddenStepper ? '100%' : `calc(100% - ${stepperWidth} - 1em)`,
                justifyContent: 'flex-start',
                height: '100%',
              }}
              gap={2}
            >
              <BoxWrapper>
                <Detail position={position} onChange={handleParamsChange} />

                <TransactionDetails isLoading={isBuilding} tx={tx} error={buildError} />
                <TransactionCheck isLoading={isChecking} check={txCheck} error={checkError} />
                <TransactionSimulation
                  simulation={txSimulation}
                  isLoading={isSimulating}
                  error={simulationError}
                />
                <Confirm handleClose={handleClose} />
              </BoxWrapper>
            </BoxWrapperColumn>

            <BoxWrapperColumn
              sx={{
                width: stepperWidth,
                justifyContent: 'flex-start',
                display: hiddenStepper ? 'none' : 'flex',
                position: 'fixed',
                right: '3rem',
              }}
            >
              <Stepper />
            </BoxWrapperColumn>
          </BoxWrapperRow>
        </BoxWrapperColumn>
      </BoxContainerWrapper>
    </Dialog>
  )
}

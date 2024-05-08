import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomTypography from 'src/components/CustomTypography'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Position } from 'src/contexts/state'
import { Confirm } from './Confirm/Confirm'
import { SetupDetails } from './Create/SetupDetails'
import { TransactionCheck } from './Create/TransactionCheck'
import { TransactionDetails } from './Create/TransactionDetails'
import { Tenderly } from './Simulation/Tenderly'
import { Stepper } from './Stepper'

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

  const hiddenStepper = useMediaQuery((theme: any) => theme.breakpoints.down('md'))

  return (
    <Dialog
      fullScreen={true}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        backgroundColor: 'custom.grey.light',
      }}
    >
      <BoxContainerWrapper sx={{ maxHeight: '840px' }}>
        <BoxWrapperRow sx={{ padding: '20px', justifyContent: 'space-between' }}>
          <Box />
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </BoxWrapperRow>

        <BoxWrapperColumn sx={{ paddingRight: '10%', paddingLeft: '10%' }} gap={2}>
          <BoxWrapperRowStyled gap={2}>
            <CustomTypography variant="h6">Confirm exit strategy execution</CustomTypography>
          </BoxWrapperRowStyled>
          <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between', alignItems: 'self-start' }}>
            <BoxWrapperColumn
              sx={{
                width: hiddenStepper ? '100%' : 'calc(100% - 350px)',
                justifyContent: 'flex-start',
                height: '100%',
              }}
              gap={2}
            >
              <BoxWrapper>
                <SetupDetails position={position} />
                <TransactionDetails />
                <TransactionCheck />
                <Tenderly />
                <Confirm handleClose={handleClose} />
              </BoxWrapper>
            </BoxWrapperColumn>

            <BoxWrapperColumn
              sx={{
                width: '350px',
                justifyContent: 'flex-start',
                display: hiddenStepper ? 'none' : 'flex',
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

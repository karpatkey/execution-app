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

import { BuildParams, useTxBuild, useTxCheck, useTxSimulation } from 'src/queries/execution'

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

  const smallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

  const [params, setParams] = useState<BuildParams | undefined>(undefined)

  const handleParamsChange = useCallback(
    (params: any) => {
      console.log({ handleParamsChange: params })
      setParams({
        dao: position.dao,
        blockchain: position.blockchain,
        protocol: position.protocol,
        pool_id: position.pool_id,
        strategy: params.strategy,
        percentage: params.percentage,
        exit_arguments: params,
      })
    },
    [position],
  )

  const { data: tx, isLoading: isBuilding, error: buildError } = useTxBuild(params)
  const {
    data: txCheck,
    isLoading: isChecking,
    error: checkError,
  } = useTxCheck(
    params && tx?.tx_transactables
      ? {
          dao: params.dao,
          blockchain: params.blockchain,
          protocol: params.protocol,
          tx_transactables: tx.tx_transactables,
        }
      : undefined,
  )
  const {
    data: txSimulation,
    isLoading: isSimulating,
    error: simulationError,
  } = useTxSimulation(
    params && tx?.tx_transactables
      ? {
          dao: params.dao,
          blockchain: params.blockchain,
          transaction: tx.transaction,
        }
      : undefined,
  )

  const modalPadding = smallScreen ? '1rem' : '3rem'
  return (
    <Dialog
      fullScreen={smallScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
      sx={{
        backgroundColor: 'custom.grey.light',
      }}
      PaperProps={{ sx: { flexGrow: 1 } }}
    >
      <BoxContainerWrapper sx={{}}>
        <BoxWrapperRow sx={{ padding: '1rem', justifyContent: 'flex-end' }}>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </BoxWrapperRow>

        <BoxWrapperColumn
          sx={{
            paddingRight: modalPadding,
            paddingLeft: modalPadding,
            paddingBottom: modalPadding,
          }}
          gap={2}
        >
          <BoxWrapperRowStyled gap={2}>
            <CustomTypography variant="h6">Strategy execution</CustomTypography>
          </BoxWrapperRowStyled>
          <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between', alignItems: 'self-start' }}>
            <BoxWrapperColumn
              sx={{
                width: '100%',
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
                {tx && txCheck && txSimulation ? (
                  <Confirm
                    position={position}
                    tx={tx}
                    txCheck={txCheck}
                    txSimulation={txSimulation}
                    handleClose={handleClose}
                  />
                ) : null}
              </BoxWrapper>
            </BoxWrapperColumn>
          </BoxWrapperRow>
        </BoxWrapperColumn>
      </BoxContainerWrapper>
    </Dialog>
  )
}

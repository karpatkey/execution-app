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

import {
  BuildParams,
  useExecute,
  useTxBuild,
  useTxCheck,
  useTxSimulation,
} from 'src/queries/execution'

interface ModalProps {
  open: boolean
  positions: Position[]
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
  const { positions, open, handleClose } = props

  const smallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

  const [params, setParams] = useState<BuildParams | undefined>(undefined)
  const [executing, setExecuting] = useState(false)

  const handleParamsChange = useCallback(
    (params: any) => {
      if (!params) return setParams(undefined)

      const position = positions[0]

      setParams({
        dao: position.dao,
        blockchain: position.blockchain,
        protocol: position.protocol,
        strategy: params.strategy,
        percentage: params.percentage,
        exit_arguments: positions.map((p) => ({ pool_id: p.pool_id, ...params })),
      })
    },
    [positions],
  )

  const { data: tx, isLoading: isBuilding, error: buildError } = useTxBuild(params, !executing)
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

  const execution = useExecute([tx?.transaction])
  const onExecute = useCallback(async () => {
    if (!tx) return false

    setExecuting(true)

    execution.mutate({
      dao: params?.dao,
      blockchain: params?.blockchain,
      transaction: tx?.transaction,
    })
  }, [tx, execution, params?.blockchain, params?.dao])

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
                <Detail positions={positions} onChange={handleParamsChange} />

                <TransactionDetails isLoading={isBuilding} tx={tx} error={buildError} />
                <TransactionCheck isLoading={isChecking} check={txCheck} error={checkError} />
                <TransactionSimulation
                  simulation={txSimulation}
                  isLoading={isSimulating}
                  error={simulationError}
                />
                {tx && txCheck && txSimulation ? (
                  <Confirm
                    position={positions[0]}
                    tx={tx}
                    txCheck={txCheck}
                    txSimulation={txSimulation}
                    execution={execution}
                    onExecute={onExecute}
                    onClose={handleClose}
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

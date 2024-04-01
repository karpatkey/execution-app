import { LoopOutlined } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepperMUI from '@mui/material/Stepper'
import * as React from 'react'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import { SetupStatus } from 'src/contexts/state'

type Step = {
  key: string
  label: string
}

const steps: Step[] = [
  {
    key: 'create',
    label: 'Overview',
  },
  {
    key: 'transaction_build',
    label: 'Transaction details',
  },
  {
    key: 'transaction_check',
    label: 'Transaction check',
  },
  {
    key: 'simulation',
    label: 'Simulation',
  },
  {
    key: 'confirm',
    label: 'Confirmation',
  },
]

const LoadingStepIcon = () => (
  <LoopOutlined
    sx={{
      animation: 'spin 2s linear infinite',
      '@keyframes spin': {
        '0%': {
          transform: 'rotate(360deg)',
        },
        '100%': {
          transform: 'rotate(0deg)',
        },
      },
    }}
  />
)

export const Stepper = () => {
  const { state } = useApp()

  const status = state?.setup?.status ?? ('create' as SetupStatus)
  const activeStep = React.useMemo(() => {
    if (status == 'confirm' && state?.setup?.confirm?.status == 'success') {
      // "last" step after successful execution
      return steps.length
    } else {
      return steps.findIndex((step) => {
        return step.key === status
      })
    }
  }, [status, state?.setup?.confirm?.status])

  const isStepLoading = (step: Step) => {
    switch (step.key) {
      case 'transaction_build':
        return state?.setup?.transactionBuild?.status == 'loading'
      case 'transaction_check':
        return state?.setup?.transactionCheck?.status == 'loading'
      case 'simulation':
        return state?.setup?.simulation?.status == 'loading'
      case 'confirm':
        return state?.setup?.confirm?.status == 'loading'
    }
    return false
  }

  return (
    <Box sx={{ backgroundColor: 'white', borderRadius: '8px' }}>
      <BoxWrapperRow
        sx={{ justifyContent: 'flex-start', borderBottom: '1px solid #B6B6B6' }}
        gap={2}
      >
        <CustomTypography
          variant="body2"
          sx={{
            m: 3,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '90%',
          }}
        >
          Transaction status
        </CustomTypography>
      </BoxWrapperRow>
      <StepperMUI activeStep={activeStep} orientation="vertical" sx={{ m: 3 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel icon={isStepLoading(step) && <LoadingStepIcon />}>
              <CustomTypography
                variant="body2"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  width: '90%',
                }}
              >
                {step.label}
              </CustomTypography>
            </StepLabel>
          </Step>
        ))}
      </StepperMUI>
      {false && activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <CustomTypography variant={'h6'} sx={{ m: 3 }}>
            All steps completed - you&apos;re finished
          </CustomTypography>
        </Paper>
      )}
    </Box>
  )
}

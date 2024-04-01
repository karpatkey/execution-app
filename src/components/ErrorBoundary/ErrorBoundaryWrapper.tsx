import { ComponentProps, ReactElement } from 'react'
import ErrorBoundary from 'src/components/ErrorBoundary/ErrorBoundary'

const ErrorBoundaryWrapper = (props: ComponentProps<any>): ReactElement => {
  const handleError = (error: any) => {
    // do something
    console.error('ERROR HANDLER', error)
  }

  return <ErrorBoundary handleError={handleError} {...props} />
}

export default ErrorBoundaryWrapper

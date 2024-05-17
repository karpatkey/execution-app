import dynamic from 'next/dynamic'
import { ComponentProps, ErrorInfo, FC } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'

const ErrorFallback = dynamic(() => import('./ErrorFallback'), { ssr: false })

interface ErrorBoundaryWrapperProps extends ComponentProps<any> {
  handleError: (error: Error, info: ErrorInfo) => void
}

const ErrorBoundary: FC<ErrorBoundaryWrapperProps> = ({ handleError, children }) => (
  <ErrorBoundaryComponent FallbackComponent={ErrorFallback} onError={handleError}>
    {children}
  </ErrorBoundaryComponent>
)

export default ErrorBoundary

import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import PaperSection from 'src/components/PaperSection'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import { Position } from 'src/contexts/state'
import Detail from 'src/views/Position/Detail'

const WrappedPosition = ({ position }: { position: Position }) => {
  const title = `Strategy configuration`

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        <PaperSection title={title}>
          <Detail position={position} />
        </PaperSection>
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

export default WrappedPosition

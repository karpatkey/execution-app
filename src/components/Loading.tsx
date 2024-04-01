import { SxProps } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

interface LoadingProps {
  fullPage?: boolean
  sx?: SxProps
  size?: number | string
}

const Loading = (props: LoadingProps) => {
  const minHeight = props.fullPage ? `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)` : null
  return (
    <BoxWrapperColumn
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
        ...(props.sx || {}),
      }}
    >
      <CircularProgress color="primary" size={props.size} />
    </BoxWrapperColumn>
  )
}

export default Loading

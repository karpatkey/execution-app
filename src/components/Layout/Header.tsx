import { useUser } from '@auth0/nextjs-auth0/client'
import { Avatar, Button } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/navigation'
import { ChainFilter } from 'src/components/ChainFilter'
import CustomTypography from 'src/components/CustomTypography'
import { DAOFilter } from 'src/components/DAOFilter'
import Loading from 'src/components/Loading'
import LogoKarpatkey from 'src/components/LogoKarpatkey'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { usePositions } from 'src/queries/positions'
import 'src/services/wallet_connect'

export const HEADER_HEIGHT = 100

const NotLoggedComponent = () => {
  const { push } = useRouter()

  const onLogin = () => {
    push('/api/auth/login')
  }
  return (
    <Button onClick={onLogin} variant="contained" size="large" sx={{ borderRadius: '0.8rem' }}>
      Login
    </Button>
  )
}

interface LoggedComponentProps {
  name: string
  image: string
}

const LoggedComponent = (props: LoggedComponentProps) => {
  const { name, image } = props
  const { push } = useRouter()

  const matches = useMediaQuery((theme: any) => theme.breakpoints.up('sm'))

  const onLogout = () => {
    push('/api/auth/logout')
  }
  return (
    <BoxWrapperRow>
      <DAOFilter />
      <ChainFilter />
      <BoxWrapperRow>
        {matches && <Avatar alt={name} src={image} imgProps={{ loading: 'lazy' }} />}
        <CustomTypography
          ellipsis={true}
          sx={{
            gap: 2,
            maxWidth: 'min-content',
            padding: '6px 14px',
            alignItems: 'center',
          }}
        >
          {name}
        </CustomTypography>
      </BoxWrapperRow>
      <w3m-button />
      <Button onClick={onLogout} variant="contained" size="large" sx={{ borderRadius: '0.8rem' }}>
        Logout
      </Button>
    </BoxWrapperRow>
  )
}

const Header = () => {
  const { user, isLoading } = useUser()
  const { isRefetching: isLoadingPositions } = usePositions()

  const name = user?.name ?? ''
  const image = user?.picture ?? ''

  const loggedComponentProps = {
    name,
    image,
  }

  return (
    <BoxWrapperRow
      sx={{
        backgroundColor: 'background.default',
        justifyContent: 'space-between',
        // paddingX: '26px',
        paddingRight: '3rem',
        paddingLeft: '3rem',
        height: HEADER_HEIGHT,
      }}
    >
      <BoxWrapperRow>
        <LogoKarpatkey />
        {isLoadingPositions ? <Loading sx={{ marginLeft: '2em' }} size={'1rem'} /> : null}
      </BoxWrapperRow>
      <BoxWrapperRow>
        {!isLoading ? (
          !user ? (
            <NotLoggedComponent />
          ) : (
            <LoggedComponent {...loggedComponentProps} />
          )
        ) : null}
      </BoxWrapperRow>
    </BoxWrapperRow>
  )
}

export default Header

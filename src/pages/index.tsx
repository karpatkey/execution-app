import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import CustomTypography from 'src/components/CustomTypography'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import PageLayout from 'src/components/Layout/Layout'
import Loading from 'src/components/Loading'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'

const Homepage = (): ReactElement => {
  const { user, error, isLoading } = useUser()
  const { push } = useRouter()

  if (isLoading) return <Loading fullPage />
  if (error) push('/500')
  if (!user) {
    return (
      <BoxContainerWrapper>
        <CustomTypography
          variant="h3"
          sx={{
            display: 'flex',
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          To view the positions you need to Login
        </CustomTypography>
      </BoxContainerWrapper>
    )
  }

  push('/positions')
  return <></>
}

Homepage.getTitle = 'Home'

Homepage.getLayout = (page: ReactElement) => <PageLayout>{page}</PageLayout>

export default Homepage

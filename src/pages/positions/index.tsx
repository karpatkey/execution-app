import { getSession, Session } from '@auth0/nextjs-auth0'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { NextApiRequest, NextApiResponse } from 'next'
import * as React from 'react'
import { ReactElement } from 'react'
import PageLayout from 'src/components/Layout/Layout'
import { useApp } from 'src/contexts/app.context'
import { addDAOs, addDaosConfigs } from 'src/contexts/reducers'
import { getDaosConfigs } from 'src/utils/jsonsFetcher'
import WrapperPositions from 'src/views/Positions/WrapperPositions'

interface PositionsPageProps {
  daos: string[]
  daosConfigs: any
}

const PositionsPage = (props: PositionsPageProps) => {
  const { daos, daosConfigs = [] } = props

  const { dispatch } = useApp()

  React.useEffect(() => {
    dispatch(addDAOs(daos))
    dispatch(addDaosConfigs(daosConfigs))
  }, [dispatch, daos, daosConfigs])

  return <WrapperPositions />
}

PositionsPage.getTitle = 'Home'

PositionsPage.getLayout = (page: ReactElement) => <PageLayout>{page}</PageLayout>

export default withPageAuthRequired(PositionsPage)

export const getServerSideProps = async (context: {
  req: NextApiRequest
  res: NextApiResponse
}) => {
  const { req, res } = context
  const session = await getSession(req as any, res as any)

  if (!session) {
    return {
      props: {
        daos: [],
      },
    }
  }

  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const daos = roles

  const daosConfigs = await getDaosConfigs(daos)

  return { props: { daos, daosConfigs } }
}

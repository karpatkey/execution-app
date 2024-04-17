import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { NextApiRequest, NextApiResponse } from 'next'
import * as React from 'react'
import { ReactElement } from 'react'
import PageLayout from 'src/components/Layout/Layout'
import { useApp } from 'src/contexts/app.context'
import { addDAOs, addDaosConfigs } from 'src/contexts/reducers'
import { authorizedDao } from 'src/services/autorizer'
import { Dao, getDaosConfigs } from 'src/services/executor/strategies'
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
  const { error, daos } = await authorizedDao(context)
  if (error) return { props: { daos: [] } }

  const daosConfigs = await getDaosConfigs(daos as Dao[])
  return { props: { daos, daosConfigs } }
}

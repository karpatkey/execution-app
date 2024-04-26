import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import * as React from 'react'
import { ReactElement } from 'react'
import PageLayout from 'src/components/Layout/Layout'
import { useApp } from 'src/contexts/app.context'
import { addDAOs, addDaosConfigs } from 'src/contexts/reducers'
import { authorizedDao } from 'src/services/authorizer'
import { Dao, getDaosConfigs } from 'src/services/executor/strategies'
import WrapperPositions from 'src/views/Positions/WrapperPositions'

interface Props {
  daos: Dao[]
  daosConfigs: any
}

const PositionsPage = (props: Props) => {
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

export default PositionsPage

// export const getServerSideProps = withPageAuthRequired(async (context: {
//   req: NextApiRequest
//   res: NextApiResponse
// }) => {
//   const { error, daos } = await authorizedDao(context)
//   if (error) return { props: { daos: [] } }
//
//   const daosConfigs = await getDaosConfigs(daos as Dao[])
//
//   context.res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=3600')
//
//   return { props: { daos, daosConfigs } }
// })

export const getServerSideProps = withPageAuthRequired<any, any>({
  async getServerSideProps(ctx) {
    const { error, daos } = await authorizedDao(ctx)
    if (error) return { props: { daos: [], daosConfigs: undefined } }

    const daosConfigs = await getDaosConfigs(daos as Dao[])

    ctx.res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=3600')

    return { props: { daos, daosConfigs } }
  },
})

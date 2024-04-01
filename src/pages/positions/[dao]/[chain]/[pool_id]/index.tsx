import { getSession, Session } from '@auth0/nextjs-auth0'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import Button from '@mui/material/Button'
import { NextApiRequest, NextApiResponse } from 'next'
import * as React from 'react'
import { ReactElement } from 'react'
import CustomTypography from 'src/components/CustomTypography'
import PageLayout from 'src/components/Layout/Layout'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { useApp } from 'src/contexts/app.context'
import { addDaosConfigs, updateEnvNetworkData } from 'src/contexts/reducers'
import { Position } from 'src/contexts/state'
import { getDaosConfigs } from 'src/utils/jsonsFetcher'
import PositionDetail from 'src/views/Position/WrappedPosition'

interface PositionIndexProps {
  positionId: Maybe<string>
  position: Maybe<Position>
  ENV_NETWORK_DATA: any
  daosConfigs: any[]
  dao: string
  chain: string
  pool_id: string
}

const PositionDoesntExist = () => {
  return (
    <BoxWrapperColumn gap={4} sx={{ alignItems: 'center' }}>
      <CustomTypography variant="h3" align="center" style={{ marginTop: '35vh' }}>
        Position doesn't exist
      </CustomTypography>
      <Button variant="contained" color="primary" href="/positions" sx={{ width: '300px' }}>
        Go to Home page
      </Button>
    </BoxWrapperColumn>
  )
}

import Loading from 'src/components/Loading'
import { usePosition } from 'src/queries/positions'

const PositionIndex = (props: PositionIndexProps): ReactElement => {
  const { dao, chain, pool_id, ENV_NETWORK_DATA, daosConfigs } = props

  const { dispatch } = useApp()

  const { data: position } = usePosition(dao, chain, pool_id)

  React.useEffect(() => {
    dispatch(addDaosConfigs(daosConfigs))
    dispatch(updateEnvNetworkData(ENV_NETWORK_DATA))
  }, [dispatch, daosConfigs, ENV_NETWORK_DATA])

  if (!position) {
    return <Loading fullPage />
  }

  return (
    <>
      {position && (
        <BoxContainerWrapper>
          <PositionDetail position={position} />
        </BoxContainerWrapper>
      )}
      {!position && <PositionDoesntExist />}
    </>
  )
}

PositionIndex.getTitle = 'Position'

PositionIndex.getLayout = (page: ReactElement) => <PageLayout>{page}</PageLayout>

export default withPageAuthRequired(PositionIndex)

const getServerSideProps = async (context: {
  req: NextApiRequest
  res: NextApiResponse
  params: { dao: string; chain: string; pool_id: string }
}) => {
  const { req, res, params: { dao = '', chain = '', pool_id = '' } = {} } = context
  const session = await getSession(req as any, res as any)

  if (!session) {
    return {
      props: {
        daos: [],
        dao,
        chain,
        pool_id,
      },
    }
  }

  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const daos = roles

  const ENV_NETWORK_DATA = {
    MODE: process?.env?.MODE ?? 'development',
    ETHEREUM_RPC_ENDPOINT: process?.env?.ETHEREUM_RPC_ENDPOINT,
    GNOSIS_RPC_ENDPOINT: process?.env?.GNOSIS_RPC_ENDPOINT,
    LOCAL_FORK_HOST_ETHEREUM: process?.env?.LOCAL_FORK_HOST_ETHEREUM ?? 'anvil_ethereum',
    LOCAL_FORK_PORT_ETHEREUM: process?.env?.LOCAL_FORK_PORT_ETHEREUM ?? 8546,
    LOCAL_FORK_HOST_GNOSIS: process?.env?.LOCAL_FORK_HOST_GNOSIS ?? 'anvil_gnosis',
    LOCAL_FORK_PORT_GNOSIS: process?.env?.LOCAL_FORK_PORT_GNOSIS ?? 8547,
  }

  const daosConfigs = await getDaosConfigs(roles)

  return {
    props: {
      daos: daos,
      ENV_NETWORK_DATA,
      daosConfigs,
      dao,
      chain,
      pool_id,
    },
  }
}

export { getServerSideProps }

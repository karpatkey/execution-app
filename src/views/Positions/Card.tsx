import Link from 'next/link'
import TimeAgo from 'react-timeago'
import CryptoIcon from 'src/components/CryptoIcon'
import CustomTypography from 'src/components/CustomTypography'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { PositionWithStrategies } from 'src/contexts/state'
import { slug } from 'src/utils/string'
import PositionName from 'src/views/Positions/PositionName'
import ProtocolIcon from 'src/views/Positions/ProtocolIcon'
import { Title } from 'src/views/Positions/Title'
import { USD } from 'src/views/Positions/USD'
import { Balances } from './Balances'

interface PositionProps {
  id: number
  position: PositionWithStrategies
}

const SourceUpdated = ({ source, updated_at }: { source: string; updated_at: number | Date }) => {
  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Mono',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '14px',
        color: 'custom.grey.dark',
        letterSpacing: '-0.02em',
        display: 'flex',
        flexGrow: 1,
        alignItems: 'flex-end',
      }}
    >
      <span>
        from {source} <TimeAgo date={updated_at} />
      </span>
    </CustomTypography>
  )
}

const ChainsInverse = new Map([
  ['ethereum', 'eth'],
  ['gnosis', 'gno'],
  ['polygon', 'matic'],
  ['arbitrum', 'arb'],
  ['optimism', 'op'],
  ['pulse', 'pls'],
  ['avalanche', 'avax'],
  ['base', 'bsc'],
])

const Card = (props: PositionProps) => {
  const { position } = props
  const { protocol, blockchain, lptokenName, dao, isActive, tokens } = position

  const blockchainSymbol = ChainsInverse.get(blockchain) || blockchain

  const CardWrapper = () => {
    return (
      <BoxWrapperColumn
        gap={4}
        sx={{
          padding: '10px',
          width: '100%',
          justifyContent: 'space-between',
          ...(isActive ? { cursor: 'pointer' } : {}),
          ...(!isActive ? { opacity: '0.2 !important', height: '100%' } : {}),
        }}
      >
        <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
          <Title title={dao} />
          <BoxWrapperRow gap={1}>
            <CryptoIcon size={25} symbol={blockchainSymbol || ''} />
            {position.positionType !== 'token' ? (
              <>
                <ProtocolIcon protocol={protocol} />
                <Title title={protocol} />
              </>
            ) : null}
          </BoxWrapperRow>
        </BoxWrapperRow>
        <BoxWrapperColumn gap={1}>
          <BoxWrapperRow gap={1} sx={{ justifyContent: 'space-between' }}>
            <PositionName position={lptokenName} />
            <USD value={position.usd_amount} />
          </BoxWrapperRow>
        </BoxWrapperColumn>
        <Balances tokens={tokens} />
        <SourceUpdated source="Debank" updated_at={position.updated_at} />
      </BoxWrapperColumn>
    )
  }

  const wrapperStyle = { textDecoration: 'none', display: 'flex', flexGrow: 1 }

  const render = isActive ? (
    <Link
      href={`/positions/${slug(position.dao)}/${position.blockchain}/${position.pool_id}`}
      style={wrapperStyle}
    >
      <CardWrapper />
    </Link>
  ) : (
    <CardWrapper />
  )

  return (
    <>
      {render}

      {false ? (
        <CustomTypography
          sx={{
            fontFamily: 'IBM Plex Mono',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '10px',
            lineHeight: '10px',
            color: 'custom.grey.dark',
            letterSpacing: '-0.02em',
            display: 'flex',
            flexGrow: 1,
            alignItems: 'flex-end',
          }}
        >
          <pre>{JSON.stringify(position, null, 2)}</pre>
        </CustomTypography>
      ) : null}
    </>
  )
}

export default Card

import { Box, Divider } from '@mui/material'
import CryptoIcon from 'src/components/CryptoIcon'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Token } from '../../contexts/state'
import { AmountValue } from './AmountValue'
import { Title } from './Title'
import { USD } from './USD'

interface ListItemsProps {
  tokens: Token[] | undefined
}

type TokenGroup = 'supply' | 'borrow' | 'reward' | 'other' | 'core'

type GroupedTokens = {
  [name in TokenGroup]: Token[]
}

const BalanceGroup = ({ name, tokens }: { name: TokenGroup; tokens: Token[] }) => {
  return (
    <BoxWrapperColumn gap={0.8}>
      {tokens.map((token: Token) => {
        const { symbol, amount, price } = token
        return (
          <Box key={name + symbol + amount}>
            <BoxWrapperColumn gap={0.5}>
              <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                <BoxWrapperRow gap={1.2}>
                  <CryptoIcon symbol={symbol} />
                  <Title title={symbol} />
                </BoxWrapperRow>
                <AmountValue value={amount} />
                {name !== 'core' ? <USD value={amount * price} /> : null}
              </BoxWrapperRow>
              <Divider />
            </BoxWrapperColumn>
          </Box>
        )
      })}
    </BoxWrapperColumn>
  )
}

export const Balances = ({ tokens }: ListItemsProps) => {
  const groups = (tokens || []).reduce(
    (acc: GroupedTokens, token) => {
      acc[token.as].push(token)
      return acc
    },
    { supply: [], borrow: [], reward: [], other: [], core: [] },
  )

  const ordered: TokenGroup[] = ['core', 'supply', 'borrow']

  return (
    <BoxWrapperColumn gap={0.8}>
      {ordered.map((name) => {
        const tokens = groups[name]
        return tokens.length > 0 ? <BalanceGroup key={name} name={name} tokens={tokens} /> : null
      })}
    </BoxWrapperColumn>
  )
}

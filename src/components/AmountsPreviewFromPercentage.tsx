import { Position } from 'src/contexts/state'

const format = (value: number) => {
  const Amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
  return Amount.format(+value)
}

export const AmountsPreviewFromPercentage = ({
  positions,
  percentage,
  tokenOut,
}: {
  positions: Position[]
  percentage: any
  tokenOut?: string
}) => {
  if (!percentage || percentage > 100) return null

  const allTokens = positions.flatMap((p) => p.tokens)
  let tokens = allTokens.filter((t) => t.as == 'supply')
  if (tokens.length == 0) tokens = allTokens.filter((t) => t.as == 'core')
  const pct = +percentage / 100

  if (tokenOut) {
    const totalUsd = tokens.reduce((acc, t) => t.price * t.amount + acc, 0)
    const findToken = (id: string) =>
      tokens.find((t) => (t.id || '').toLowerCase() == id.toLowerCase())

    const out = findToken(tokenOut)
    if (!out) return null

    const usdToGetOut = totalUsd * pct
    const amountToGetOut = usdToGetOut / out.price

    return <span key={out.symbol}>{`${out.symbol} ${format(amountToGetOut)}`}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {tokens.map((token) => (
        <span key={token.symbol}>{`${token.symbol} ${format(token.amount * pct)}`}</span>
      ))}
    </div>
  )
}

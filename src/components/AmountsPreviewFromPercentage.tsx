import { Position } from 'src/contexts/state'

const format = (value: number) => {
  const Amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
  return Amount.format(+value)
}

export const AmountsPreviewFromPercentage = ({
  position,
  percentage,
  tokenOut,
}: {
  position: Position
  percentage: any
  tokenOut?: string
}) => {
  if (!percentage) return null

  let tokens = position.tokens.filter((t) => t.as == 'supply')
  if (tokens.length == 0) tokens = position.tokens.filter((t) => t.as == 'core')
  const pct = +percentage / 100

  if (tokenOut) {
    const totalUsd = tokens.reduce((acc, t) => t.price * t.amount + acc, 0)
    const findToken = (id: string) =>
      tokens.find((t) => (t.id || '').toLowerCase() == id.toLowerCase())
    let out = findToken(tokenOut)

    if (!out && tokenOut) {
      if (tokenOut == '0xaf204776c7245bF4147c2612BF6e5972Ee483701') out = findToken('xdai')
    }

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

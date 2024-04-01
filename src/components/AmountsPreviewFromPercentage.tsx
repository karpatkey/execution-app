import { Position } from 'src/contexts/state'

export const AmountsPreviewFromPercentage = ({
  position,
  percentage,
}: {
  position: Position
  percentage: any
}) => {
  if (!percentage) return null

  return (
    <>
      {(position.tokens || []).map((token: any) => {
        if (token.as == 'supply') {
          return (
            <span key={token.symbol}>
              {`${token.symbol} ${token.amount * (+percentage / 100)}`}
            </span>
          )
        }
      })}
    </>
  )
}

import { daoWallets } from 'src/config/constants'
import * as debank from 'src/services/debank/debank'

interface PositionsResponse {
  data: Position[]
  error?: string
}

export async function getPositions(daos: string[]): Promise<PositionsResponse> {
  try {
    return await debankAdapter().getPositions(daos)
  } catch (e) {
    console.error('Positions error:', e)
    // return dwAdapter().getPositions(daos)
    if (e instanceof Error) {
      e = e.message
    }
    return { error: e as string, data: [] }
  }
}

interface Token {
  symbol: string
  as: 'supply' | 'borrow' | 'reward' | 'other'
  amount: number
  price: number
  updatedAt: number
}

interface Position {
  // position_id: string
  dao: string
  protocol: string
  blockchain: string
  pool_id: string
  lptoken_name: string
  tokens?: Token[]
}

interface Adapter {
  getPositions: (wallets: string[]) => Promise<{ data: Position[] }>
  enabled: () => boolean
}

const MIN_USD_AMOUNT = process.env.AXA_MIN_USD_AMOUNT || 5000

function translateId(id: string) {
  if (['eth', 'xdai'].includes(id)) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  return id
}

async function getDebankPositions(daos: string[]): Promise<{ data: Position[] }> {
  const dwallets = daos.map((dao) => ({ dao, wallets: daoWallets(dao) }))
  const wallets = dwallets.flatMap((dw) => dw.wallets)
  const walletPositions = await debank.getPositions(wallets)

  const walletDao = new Map<string, string>(
    dwallets.flatMap(({ dao, wallets }) => wallets.map((wallet) => [wallet.address, dao])),
  )

  const data = walletPositions.flatMap((walletPosition) => {
    const dao = walletDao.get(walletPosition.wallet) || ''

    const positions = walletPosition.positions
      .map((position) => {
        const lptokenName = lptokenNameFromPosition(position)
        return {
          ...position,
          pool_id: translateId(position.pool_id),
          dao,
          protocol: position.protocol_name,
          positionType: position.position_type,
          lptokenName: position.lptoken_name || lptokenName,
          blockchain: position.chain,
          tokens: position.tokens.map((t) => ({ ...t, id: translateId(t.id) })),
        }
      })
      .filter((p: any) => p.usd_amount > MIN_USD_AMOUNT)

    const tokens = walletPosition.tokens
      .map((t: any) => {
        return {
          dao,
          ...t,
          usd_amount: t.price * t.amount,
          positionType: 'token',
          lptokenName: t.symbol,
          pool_id: translateId(t.id),
          protocol: 'Wallet',
          blockchain: t.chain,
          tokens: [
            {
              id: translateId(t.id),
              symbol: t.symbol,
              as: 'core',
              amount: t.amount,
              price: t.price,
            },
          ],
        }
      })
      .filter((p: any) => p.usd_amount > MIN_USD_AMOUNT)

    const bareTokens = tokens.filter((token) => {
      const p = positions.find(
        (p) => p.pool_id == token.pool_id && p.dao == token.dao && p.chain == token.chain,
      )
      if (p) {
        p.tokens.push(token.tokens[0])
        return false
      } else {
        return true
      }
    })

    return positions.concat(bareTokens)
  })

  return { data }
}

function lptokenNameFromPosition(position: debank.ResponsePosition) {
  const symbols = (position.tokens || []).filter((t) => t.as == 'supply').map((t) => t.symbol)
  return symbols.sort().join('+')
}

function debankAdapter() {
  return { getPositions: getDebankPositions, enabled: () => true } as Adapter
}

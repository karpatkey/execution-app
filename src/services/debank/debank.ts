function accessKey() {
  return process.env.DEBANK_API_KEY || ''
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

const MAX_RETRIES = 3
function retryBackoff(retriesLeft: number) {
  const randomPart = (Math.floor(Math.random() * 10) + 1) * 50
  const extraSecondPerRetry = (1 + MAX_RETRIES - retriesLeft) * 1000
  return extraSecondPerRetry + randomPart
}

function chainNumberToId(chain: number): string | undefined {
  const m = new Map([
    [1, 'eth'],
    [100, 'xdai'],
  ])
  return m.get(chain)
}

const MIN_USD_AMOUNT = process.env.AXA_MIN_USD_AMOUNT || 5000

async function fetchDebankWalletData(wallet: Wallet): Promise<any> {
  const chainId = chainNumberToId(wallet.chainId)
  const list = await getDebank(
    `/v1/user/simple_protocol_list?chain_id=${chainId}&id=${wallet.address}`,
  )

  const protocols = list
    .filter((p: any) => p.net_usd_value > MIN_USD_AMOUNT)
    .map((p: any) => {
      return getDebank(`/v1/user/protocol?protocol_id=${p.id}&id=${wallet.address}`)
    })

  const results = await Promise.all(protocols)
  const message = results.find((p) => p.message)?.message
  if (message) return { message }

  return results.flatMap((p: any) => p)
}

async function fetchDebankTokensData(address: string) {
  return await getDebank(`/v1/user/all_token_list?isAll=true&id=${address}`)
}

async function fetchWallet(wallet: Wallet) {
  console.debug(`CALLED FETCH_WALLET ${wallet.chainId} ${wallet.address}`)
  const p1 = fetchDebankWalletData(wallet)
  const p2 = fetchDebankTokensData(wallet.address)
  const positions = await p1
  const tokens = await p2
  return { positions, tokens, updatedAt: +new Date() }
}

// Switch to this one for run as script in json-builder
let getFromDebank = fetchWallet

if (process.env.NODE_ENV != 'test') {
  ;(async function () {
    // Use caching
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: ExpiryMap } = await import('expiry-map')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: pMemoize } = await import('p-memoize')
    const cache = new ExpiryMap(20 * 60 * 1000)
    getFromDebank = pMemoize(fetchWallet, { cache })
  })()
}

async function getDebank(path: string, retriesLeft: number = MAX_RETRIES): Promise<any> {
  try {
    const url = `https://pro-openapi.debank.com${path}`
    const headers = { accept: 'application/json', AccessKey: accessKey() }
    // console.debug(`[DeBank] fetching ${url}`)
    const response = await fetch(url, { headers })
    const data = await response.json()
    return data
  } catch (error) {
    // console.error(error)
    if (retriesLeft > 0) {
      const backoff = retryBackoff(retriesLeft)
      console.log(`Retrying Debank call ${path} in ${Math.round(backoff)}ms`)
      await wait(backoff)
      return await getDebank(path, retriesLeft - 1)
    } else {
      throw error
    }
  }
}

export interface DebankToken {
  name: string
  symbol: string
  display_symbol: string
  optimized_symbol: string
  decimals: number
  logo_url: string
  protocol_id: string
  price: number
  is_core: boolean
  is_wallet: boolean
  time_at: number
  amount: number
  raw_amount: number
  id: string
  chain: string
}
export interface DebankPositionItem {
  stats: {
    asset_usd_value: number
    debt_usd_value: number
    net_usd_value: number
  }
  update_at: number
  name: string
  detail_types: string[]
  pool: {
    id: string
  }
  detail: {
    description: string
    supply_token_list: {
      id: string
      chain: string
      name: string
      symbol: string
      display_symbol?: string
      optimized_symbol: string
      decimals: number
      logo_url: string
      protocol_id: string
      price: number
      is_verified: boolean
      is_core: boolean
      is_wallet: boolean
      time_at: number
      amount: number
    }[]
    borrow_token_list: {
      id: string
      chain: string
      name: string
      symbol: string
      display_symbol?: string
      optimized_symbol: string
      decimals: number
      logo_url: string
      protocol_id: string
      price: number
      is_verified: boolean
      is_core: boolean
      is_wallet: boolean
      time_at: number
      amount: number
    }[]
  }
}
export interface DebankPosition {
  id: string
  chain: string
  name: string
  site_url: string
  logo_url: string
  has_supported_portfolio: boolean
  tvl: number
  portfolio_item_list: DebankPositionItem[]
}

export type ResponsePosition = {
  usd_amount: number
  chain: string
  position_type: string
  pool_id: string
  protocol_name: string
  lptoken_name: string
  updated_at: number
  tokens: any[]
}
type ResponseToken = DebankToken

interface DebankFullResponse {
  wallet: string
  positions: ResponsePosition[]
  tokens: ResponseToken[]
}

async function transformData(
  wallet: string,
  positions: DebankPosition[],
  tokens: DebankToken[],
  updatedAt: number,
): Promise<DebankFullResponse> {
  return {
    positions: positions.flatMap(transformPosition),
    tokens: tokens.flatMap(transformToken(updatedAt)),
    wallet: wallet,
  }
}

const Chains = new Map([
  ['eth', 'ethereum'],
  ['xdai', 'gnosis'],
  ['matic', 'polygon'],
  ['arb', 'arbitrum'],
  ['op', 'optimism'],
  ['pls', 'pulse'],
  ['avax', 'avalanche'],
  ['bsc', 'base'],
])

const Protocols = new Map([
  ['Aura Finance', 'Aura'],
  ['Balancer V2', 'Balancer'],
  ['LIDO', 'Lido'],
])

function fixProtocol(chain: string, protocol: string, pool_id: string) {
  switch ([chain, protocol, pool_id.toLowerCase()].toString()) {
    case ['ethereum', 'Maker', '0x83f20f44975d03b1b09e64809b757c47f942beea'].toString():
      return 'Spark'
    case ['gnosis', 'Gnosis', '0xaf204776c7245bf4147c2612bf6e5972ee483701'].toString():
      return 'Spark'
  }

  return protocol
}

import kitchen_data from './kitchen.json'
const PositionNamesFromPoolId = new Map(
  kitchen_data.map((d) => [d.lptoken_address, d.lptoken_name]),
)
const transformToken = (updatedAt: number) => (token: DebankToken) => {
  return {
    ...token,
    updated_at: updatedAt,
    chain: Chains.get(token.chain) || token.chain,
  }
}

function transformPosition(position: DebankPosition): ResponsePosition[] {
  const protocol_name = Protocols.get(position.name) || position.name
  const chain = Chains.get(position.chain) || position.chain
  const tokenOfType =
    (t: any) =>
    ({ id, symbol, amount, price }: any) => ({ id, symbol, amount, price, as: t })

  return position.portfolio_item_list.flatMap((i) => {
    const tokens = [
      ...(i.detail.supply_token_list || []).map(tokenOfType('supply')),
      ...(i.detail.borrow_token_list || []).map(tokenOfType('borrow')),
      // ...(i.detail.reward_token_list || []).map(tokenOfType('reward')),
      // ...(i.detail.other_tokens_list || []).map(tokenOfType('other')),
    ].filter((l) => l)

    const position_type = i.name
    const pool_id = i.pool.id.replace(/(:.*)/g, '')
    const lptoken_name = PositionNamesFromPoolId.get(pool_id) || i.detail.description

    return {
      debank: i,
      usd_amount: i.stats.asset_usd_value,
      chain,
      position_type,
      pool_id,
      protocol_name: fixProtocol(chain, protocol_name, pool_id),
      lptoken_name,
      tokens,
      updated_at: i.update_at * 1000,
    }
  })
}

type Wallet = {
  address: string
  chainId: number
}

export async function getPositions(wallets: Wallet[]) {
  const processWallet = async (wallet: Wallet) => {
    const { positions, tokens, updatedAt } = await getFromDebank(wallet)
    if (positions.message || tokens.message) {
      throw new Error(positions.message || tokens.message)
    }
    return transformData(wallet.address, positions, tokens, updatedAt)
  }
  return await Promise.all(wallets.flatMap(processWallet))
}

type DebankStatusResp = {
  ok: boolean
  balance?: number
  threshold?: number
  error?: string
}

const UNITS_THRESHOLD = 100000

export async function getStatus(): Promise<DebankStatusResp> {
  try {
    const units = await getDebank('/v1/account/units')

    if (units.message) throw new Error(units.message)

    const balance = units.balance
    if (!units.balance) throw new Error('No balance?')

    if (balance < UNITS_THRESHOLD) {
      return {
        ok: false,
        balance,
        threshold: UNITS_THRESHOLD,
        error: 'Low or no units left',
      }
    } else {
      return {
        ok: true,
        threshold: UNITS_THRESHOLD,
        balance,
      }
    }
  } catch (e: any) {
    console.error(e)
    return {
      ok: false,
      error: e.message,
    }
  }
}

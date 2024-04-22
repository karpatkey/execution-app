import { keccak256, toUtf8Bytes } from 'ethers'
// import { version } from 'package.json'

export type CowOrderRequest = {
  sellToken: string
  buyToken: string
  receiver: string
  sellAmount: string
  buyAmount: string
  validTo: number
  feeAmount: string
  kind: string
  sellTokenBalance: string
  signingScheme: string
  partiallyFillable: boolean
  signature: string
  from: string
}

export type Chain = 'xdai' | 'eth'

export function createOrder(chain: Chain, args: CowOrderRequest) {
  const body = {
    ...args,
    ...appDataArgs(),
  }
  return post(chain, '/api/v1/orders', body)
}

function appDataArgs() {
  const meta = { appCode: 'santi_the_best' }

  // It could be that encoding in a deterministic way here is required
  const appData = JSON.stringify(meta)
  const appDataHash = keccak256(toUtf8Bytes(appData))

  return {
    appData,
    appDataHash,
  }
}

async function post(chain: Chain, path: string, body: any) {
  const url = endpoint(chain) + path

  console.debug('calling Cowswap tx: ', url, JSON.stringify(body))
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const throwError = (message: any) => {
    throw new Error(`CowswapError: ${message}`)
  }
  switch (resp.status) {
    case 201:
      return await resp.json()
    case 400:
      throwError(`invalid order ${await resp.text()}`)
    case 403:
      throwError(`Forbidden, your account is deny-listed. ${await resp.text()}`)
    default:
      throwError(`${resp.status} ${await resp.text()}`)
  }
}

function environment() {
  return process.env.MODE || 'development'
}

function endpoint(chain: Chain) {
  if (environment() == 'development') {
    return {
      // there's no env for gnosis testnet actually
      xdai: 'https://barn.api.cow.fi/xdai',
      eth: 'https://barn.api.cow.fi/mainnet',
    }[chain]
  } else {
    return {
      // there's no env for gnosis testnet actually
      xdai: 'https://api.cow.fi/xdai',
      eth: 'https://api.cow.fi/mainnet',
    }[chain]
  }
}

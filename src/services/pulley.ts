function endpoint() {
  return process.env.PULLEY_URL || 'http://localhost:4000'
}

const headers = {
  accept: 'application/json',
  'Content-Type': 'application/json',
}

async function create(chain: number) {
  try {
    const resp = await fetch(`${endpoint()}/${chain}/forks`, { method: 'POST', headers })
    if (resp.status == 201) {
      return await resp.json()
    } else {
      throw new Error('RequestError: ' + (await resp.text()))
    }
  } catch (e: any) {
    console.error('PulleyError: ', e)
    throw new Error('PulleyError: creating fork: ' + e.message)
  }
}

async function destroy(id: string) {
  const resp = await fetch(`${endpoint()}/forks/${id}`, { method: 'DELETE', headers })
  return await resp.json()
}

type StatusResponse = {
  ok: boolean
  endpoint: string
  chainStatuses?: any
  error?: string
}

async function checkForkStatus(pulley: Pulley) {
  try {
    const started = +new Date()
    const resChainId = await pulley.forkRequest({ method: 'eth_chainId' })
    const resBlockNumber = await pulley.forkRequest({ method: 'eth_blockNumber' })
    const finished = +new Date()

    const ok = resChainId.result == pulley.chain
    const took = finished - started
    return {
      ok,
      pulley,
      blockNumber: resBlockNumber.result,
      took,
      took_human: `${took / 1000}s`,
    }
  } catch (e: any) {
    console.error(e)
    return {
      ok: false,
      pulley,
      error: e.message,
    }
  }
}

export async function getStatus(): Promise<StatusResponse> {
  try {
    const [eth, xdai] = await Promise.all([1, 100].map(Pulley.start))

    const chainStatuses = await Promise.all([eth, xdai].map((p) => checkForkStatus(p)))
    await Promise.all([eth, xdai].map((p) => p.release()))

    const ok = !chainStatuses.find((c) => !c.ok)
    return {
      ok: ok,
      endpoint: endpoint(),
      chainStatuses,
    }
  } catch (e: any) {
    return {
      ok: false,
      error: e.message,
      endpoint: endpoint(),
    }
  }
}

export class Pulley {
  id: string
  chain: number
  status: string

  constructor(chain: number, id: string) {
    this.chain = chain
    this.id = id
    this.status = 'started'
  }

  static async start(chain: number) {
    const { id: id } = await create(chain)
    return new Pulley(chain, id)
  }

  get url() {
    return `${endpoint()}/forks/${this.id}`
  }

  async release() {
    const result = await destroy(this.id)
    this.status = 'shutdow'
    return result
  }

  async forkRequest(params: any) {
    const resp = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        params: [],
        ...params,
      }),
    })
    return await resp.json()
  }
}

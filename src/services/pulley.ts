function endpoint() {
  return process.env.PULLEY_URL || 'http://localhost:4000'
}

const headers = {
  accept: 'application/json',
  'Content-Type': 'application/json',
}

async function create(chain: number) {
  const resp = await fetch(`${endpoint()}/${chain}/forks`, { method: 'POST', headers })
  if (resp.status == 201) {
    return await resp.json()
  } else {
    throw new Error('Error creating Pulley fork: ' + (await resp.text()))
  }
}

async function destroy(id: string) {
  const resp = await fetch(`${endpoint()}/forks/${id}`, { method: 'DELETE', headers })
  return await resp.json()
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
}

const TENDERLY_API_URL = 'https://api.tenderly.co/api/v1'
const TENDERLY_DASHBOARD_URL = 'https://dashboard.tenderly.co'

const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT || 'mising_project'
const TENDERLY_API_TOKEN = process.env.TENDERLY_API_TOKEN || 'missing_token'
const TENDERLY_ACCOUNT_ID = process.env.TENDERLY_ACCOUNT_ID || 'missing_account_id'

const LOG_LABEL = '[Tenderly]'

async function request(path: string, body: Record<string, any>) {
  const url = TENDERLY_API_URL + path
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Key': TENDERLY_API_TOKEN,
      },
      body: JSON.stringify(body),
    })

    console.log(`${LOG_LABEL} Response status for ${path}: ${r.status}`)

    if (r.status != 200) {
      throw new Error('Failed ' + (await r.text()))
    }
    return await r.json()
  } catch (e: any) {
    console.error(`${LOG_LABEL} Error: ${url}`, e)
    return { error: `TenderlyError: ${e.message} ${url}` }
  }
}

export class Tenderly {
  async simulate(tx: any, block: number) {
    const data = {
      network_id: tx['chainId'],
      block_number: block,
      from: tx['from'],
      input: tx['data'],
      to: tx['to'],
      gas: tx['gas'],
      value: tx['value'],
      save: true,
      save_if_fails: true,
      simulation_type: 'full',
    }

    return await request(
      `/account/${TENDERLY_ACCOUNT_ID}/project/${TENDERLY_PROJECT}/simulate`,
      data,
    )
  }

  shareUrl(simulation_id: string) {
    return `${TENDERLY_DASHBOARD_URL}/shared/simulation/${simulation_id}`
  }

  async share(simulation: any) {
    if (!simulation?.id) return simulation

    const simulation_id = simulation.id
    request(
      `/account/${TENDERLY_ACCOUNT_ID}/project/${TENDERLY_PROJECT}/simulations/${simulation_id}/share`,
      {},
    )

    return {
      ...simulation,
      share_url: this.shareUrl(simulation_id),
    }
  }
}

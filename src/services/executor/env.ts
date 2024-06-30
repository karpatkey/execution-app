import { Blockchain, Dao } from 'src/config/strategies/manager'

export type Env = {
  disassembler_address?: string
  avatar_safe_address?: string
  roles_mod_address?: string
  role: number
  rpc_url?: string
  mev_rpc_url?: string
  fallback_rpc_url?: string
}

type Args = {
  blockchain: Blockchain
  dao: Dao
  connectedWallet: string
}

export async function executorEnv({ blockchain, dao }: Args): Promise<Env> {
  const daoKey =
    new Map([
      ['karpatkey DAO', 'KARPATKEY'],
      ['ENS DAO', 'ENS'],
    ]).get(dao) || dao.replaceAll(' ', '').toUpperCase()

  function getDaoConfig(name: string) {
    const key = [daoKey, blockchain, name].map((s) => s.toUpperCase()).join('_')
    return process.env[key]
  }

  function getConfig(name: string) {
    const key = [blockchain, name].map((s) => s.toUpperCase()).join('_')
    return process.env[key]
  }

  const chain = { ethereum: 1, gnosis: 100 }[blockchain.toLowerCase()]

  if (!chain) throw new Error(`Invalid blockchain ${blockchain}`)

  return {
    rpc_url: getConfig('rpc_endpoint'),
    mev_rpc_url: getConfig('rpc_endpoint_mev'),
    fallback_rpc_url: getConfig('rpc_endpoint_fallback'),
    disassembler_address: getDaoConfig('disassembler_address'),
    roles_mod_address: getDaoConfig('roles_mod_address'),
    avatar_safe_address: getDaoConfig('avatar_safe_address'),
    role: parseInt(getDaoConfig('role') || '1'),
  }
}

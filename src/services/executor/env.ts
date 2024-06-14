import { Pulley } from 'src/services/pulley'

export async function executorEnv(blockchain: string) {
  const chain = { ethereum: 1, gnosis: 100 }[blockchain.toLowerCase()]
  if (!chain) throw new Error(`Invalid blockchain ${blockchain}`)

  let fork: Pulley | null = null
  if (process.env.MODE != 'production') {
    fork = await Pulley.start(chain)
  }

  const filtered = filteredObject(process.env, [
    'PATH',
    'MODE',
    'ENVIRONMENT',
    '*_AVATAR_SAFE_ADDRESS',
    '*_ROLES_MOD_ADDRESS',
    '*_ROLE',
    '*_DISASSEMBLER_ADDRESS',
    'TENDERLY_*',
    '*_RPC_ENDPOINT*',
    'VAULT_*',
  ])

  const env = !!fork ? { ...filtered, LOCAL_FORK_URL: fork.url } : filtered

  return {
    env,
    fork,
    release: () => fork && fork.release(),
  }
}

function filteredObject(raw: any, allowed: string[]) {
  function match(key: string, rule: string) {
    if (rule[0] == '*' && rule[rule.length - 1] == '*') {
      return key.includes(rule.substring(1, rule.length - 1))
    }
    if (rule[0] == '*') {
      return key.endsWith(rule.substring(1))
    }
    if (rule[rule.length - 1] == '*') {
      return key.startsWith(rule.substring(0, rule.length - 1))
    }
    return false
  }
  return Object.keys(process.env)
    .filter((key) => allowed.includes(key) || allowed.find((r) => match(key, r)))
    .reduce((obj: any, key) => {
      obj[key] = raw[key]
      return obj
    }, {})
}

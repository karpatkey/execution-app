import { getSession } from '@auth0/nextjs-auth0'
import { IncomingMessage, ServerResponse } from 'http'

type Authorization = { error?: string; daos?: string[] }

function daosFromEnvVar(content?: string) {
  return (content || '')
    .split(',')
    .map((d) => d.trim())
    .filter((d) => !!d)
}

const WHITELISTED_DAOS = daosFromEnvVar(process.env.AXA_WHITELISTED_DAOS)
const OPEN_TO_ALL_DAOS = daosFromEnvVar(process.env.AXA_OPEN_TO_ALL_DAOS)

export async function authorizedDao(
  { req, res }: { req: IncomingMessage; res: ServerResponse },
  dao: string | null = null,
): Promise<Authorization> {
  const authError = { error: 'Unauthorized' }
  const session = await getSession(req, res)

  if (!session) return authError

  let daos = (session.user['http://localhost:3000/roles'] ?? []) as string[]
  if (WHITELISTED_DAOS.length > 0) {
    daos = daos.filter((d) => WHITELISTED_DAOS.includes(d.toUpperCase()))
  }

  if (session) daos.push(...OPEN_TO_ALL_DAOS)
  if (daos.length == 0) return authError

  if (dao && !daos.map((d) => d.toUpperCase()).includes(dao.toUpperCase())) return authError

  return {
    daos,
  }
}

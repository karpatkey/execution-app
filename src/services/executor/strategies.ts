import * as Minio from 'minio'
import { Blockchain, Dao } from 'src/config/strategies/manager'

export { type Dao }

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? ''
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? ''
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? ''
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? ''

interface File {
  dao: Dao
  updatedAt: string
  blockchain: string
  general_parameters: any
  positions: any
}

export const DAO_NAME_MAPPER: Record<string, Dao> = {
  GnosisDAO: 'Gnosis DAO',
  GnosisLtd: 'Gnosis Ltd',
  karpatkey: 'karpatkey DAO',
  BalancerDAO: 'Balancer DAO',
  ENS: 'ENS DAO',
  CoW: 'CoW DAO',
  GnosisGuild: 'Gnosis Guild',
  TestSafeDAO: 'TestSafeDAO',
}

function invert<T extends Record<any, any>>(
  data: T,
): {
  [K in keyof T as T[K]]: K
} {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]))
}

export const REVERSE_DAO_MAPPER = invert(DAO_NAME_MAPPER)

const ALL_DAOS = Object.keys(REVERSE_DAO_MAPPER)

function streamBucketToString<T>(stream: Minio.BucketStream<T>): Promise<T[]> {
  const chunks = [] as T[]
  return new Promise<T[]>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(chunks))
  })
}

async function fetchJsons(): Promise<File[]> {
  // // Simulate errors :)
  // if (Math.random() > 0.7) throw new Error('BOOM!')

  const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    useSSL: true,
  })

  const objectsStream = minioClient.listObjects(MINIO_BUCKET)

  const objects = await streamBucketToString(objectsStream)
  const res = objects
    .filter((o) => o.name?.endsWith('_strategies.json'))
    .map(async (object) => {
      const stream = await minioClient.getObject(MINIO_BUCKET, object.name ?? '')

      const streamData = new Promise((resolve, reject) => {
        let data = ''
        stream.on('data', (chunk) => (data += chunk))
        stream.on('end', () => resolve(data))
        stream.on('error', (err) => reject(err))
      })

      return streamData.then((content: any) => ({
        ...JSON.parse(content),
        updatedAt: object.lastModified?.toISOString(),
      }))
    })

  return await Promise.all(res)
}

const REFRESH_AFTER = 10 * 60 * 1000 // 10 * 60 * 1000 == 10 minutes
let LAST_REFRESH = +new Date() - REFRESH_AFTER
type Cache = File[] | null
let CACHE: Cache
let LAST_TOOK: number | null
let LAST_ERROR: string | undefined

function invalidCache() {
  return LAST_REFRESH < +new Date() - REFRESH_AFTER
}

async function refreshCache(fn: () => Promise<Cache>) {
  if (invalidCache()) {
    const started = +new Date()
    try {
      CACHE = await fn()
      LAST_ERROR = undefined
    } catch (e: any) {
      console.error('Error fetching strategies files.' + (CACHE ? ' Using outdated version' : ''))
      LAST_ERROR = e.message
      console.error(e)
    } finally {
      LAST_TOOK = +new Date() - started
      console.log(`[Strategies] Refetched json configs. took: ${(LAST_TOOK || 0) / 1000}s`)
      LAST_REFRESH = +new Date()
    }
  }
}

async function cached(fn: () => Promise<Cache>) {
  if (CACHE) {
    refreshCache(fn)
  } else {
    await refreshCache(fn)
  }
  return CACHE
}

function mapBlockchain(blockchain: string): Blockchain {
  return blockchain.toLowerCase() as Blockchain
}

function fixPosition(position: any) {
  position.exec_config.map((c: any) => {
    // FIX making it boolean because right now
    // it can be something like "false, with error: Role permissions error: ParameterNotOneOfAllowed()"
    c.stresstest = c.stresstest == true ? true : false
  })
  return position
}

export type DaoConfig = {
  positions: any[]
  dao: Dao
  blockchain: Blockchain
  general_parameters: Record<string, string>
  updatedAt: string
}

export async function getDaosConfigs(daos: string[]): Promise<DaoConfig[]> {
  const configs = await cached(fetchJsons)

  if (!configs) return []

  return configs
    .flatMap((f) => ({
      ...f,
      positions: f.positions.map(fixPosition),
      dao: DAO_NAME_MAPPER[f.dao] || f.dao,
      blockchain: mapBlockchain(f.blockchain),
    }))
    .filter((f) => {
      return daos.includes(f.dao)
    })
}

type StatusResult = {
  ok: boolean
  last_updated?: string
  last_error?: string
  total?: number
  total_positions?: number
  total_tests?: number
  total_passing?: number
  passing?: number
  strategies_human?: any
  error?: string
  meta?: any
}

export async function getDaosConfigsStatus(): Promise<StatusResult> {
  const configs = await getDaosConfigs(ALL_DAOS)
  if (configs.length == 0) return { ok: false, error: LAST_ERROR || 'No configs' }

  const lastUpdated = configs
    .flatMap((c) => c.updatedAt)
    .sort()
    .reverse()[0]
  const all_positions = configs.flatMap((c) => c.positions)
  const total_positions = all_positions.length
  const all_tests = all_positions.flatMap((p) => p.exec_config)
  const total_tests = all_tests.length
  const total_passing = all_tests.filter((p) => p.stresstest).length
  const strategies_human = configs.reduce((strateses: any, c: any) => {
    strateses[`${c.dao} on ${c.blockchain}`] = c.positions.reduce((poses: any, p: any) => {
      poses[p.position_id_human_readable] = p.exec_config.reduce((res: any, strat: any) => {
        res['__id'] = p.position_id_tech
        res['__protocol'] = p.protocol

        res[strat.label] = strat.stresstest || strat.stresstest_error
        return res
      }, {})
      return poses
    }, {})
    return strateses
  }, {})

  const time_since_last_refresh = +new Date() - LAST_REFRESH
  const daysAgo = new Date()
  daysAgo.setDate(new Date().getDay() - 2)
  const updatedInPast2Days = new Date(lastUpdated) > daysAgo

  return {
    ok: updatedInPast2Days,
    error: !updatedInPast2Days ? "Looks like it's outdated" : undefined,
    last_updated: lastUpdated,
    last_error: LAST_ERROR,
    total_positions,
    total_tests,
    total_passing,
    strategies_human,
    meta: {
      bucket: process.env.MINIO_BUCKET,
      last_refresh_at: LAST_REFRESH,
      last_refresh_at_human:
        new Date(LAST_REFRESH).toLocaleString(['en-GB'], { timeZone: 'UTC' }) + ' UTC',
      time_since_last_refresh,
      time_since_last_refresh_human: `${time_since_last_refresh / 1000}s`,
      refresh_after: REFRESH_AFTER,
      last_refresh_took: LAST_TOOK,
      last_refresh_took_human: `${(LAST_TOOK || 0) / 1000}s`,
    },
  }
}

import * as Minio from 'minio'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? ''
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? ''
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? ''
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? ''

interface File {
  dao: string
  blockchain: string
  general_parameters: any
  positions: any
}

const DAO_NAME_MAPPER = {
  GnosisDAO: 'Gnosis DAO',
  GnosisLtd: 'Gnosis Ltd',
  karpatkey: 'karpatkey DAO',
  BalancerDAO: 'Balancer DAO',
  ENS: 'ENS DAO',
  CoW: 'CoW DAO',
  GnosisGuild: 'Gnosis Guild',
} as any

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
  // if (Math.random() > 0.7) {
  //   throw new Error('BOOM!')
  // }
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

      return streamData.then((content: any) => JSON.parse(content))
    })

  return await Promise.all(res)
}

const REFRESH_AFTER = 10 * 60 * 1000 // 10 * 60 * 1000 == 10 minutes
let LAST_REFRESH = +new Date() - REFRESH_AFTER
type Cache = File[] | null
let CACHE: Cache

function invalidCache() {
  return LAST_REFRESH < +new Date() - REFRESH_AFTER
}

async function refreshCache(fn: () => Promise<Cache>) {
  if (invalidCache()) {
    try {
      console.time('[Strategies] Refetching json configs')
      CACHE = await fn()
    } catch (e) {
      console.error('Error fetching strategies files.' + (CACHE ? ' Using outdated version' : ''))
      console.error(e)
    } finally {
      console.timeEnd('[Strategies] Refetching json configs')
      LAST_REFRESH = +new Date()
    }
  }
}

export async function cached(fn: () => Promise<Cache>) {
  if (CACHE) {
    refreshCache(fn)
  } else {
    await refreshCache(fn)
  }
  return CACHE
}

export async function getDaosConfigs(daos: string[]) {
  const configs = await cached(fetchJsons)

  if (!configs) {
    return []
  }

  return configs
    .map((f) => ({
      ...f,
      dao: DAO_NAME_MAPPER[f.dao] || f.dao,
      blockchain: f.blockchain.toLowerCase(),
    }))
    .filter((f) => {
      return daos.includes(f.dao)
    })
}

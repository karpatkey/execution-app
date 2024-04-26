import Image from 'next/image'
import * as icons from './CryptoIcons/icons'

// let __FILES__: any = null
// async function getFiles(path: any): Promise<any> {
//   if (__FILES__) return __FILES__
//
//   return new Promise((resolve) => {
//     fs.readdir(path, function(err, files) {
//       if (err) return console.log(err)
//       __FILES__ = files
//
//       resolve(files)
//     })
//   })
// }

// const WITH_EXT = new Map<string, string>([
//   ['aurabal', 'webp'],
//   ['aura', 'png'],
//   ['wsteth', 'webp'],
//   ['xdai', 'webp'],
//   ['eure', 'webp'],
//   ['agve', 'webp'],
//   ['ageur', 'webp'],
//   ['gho', 'webp'],
//   ['ldo', 'webp'],
// ])

const SYMLINK = new Map<string, string>([
  ['weth', 'eth'],
  ['aave v2', 'aave'],
  ['aave v3', 'aave'],
  ['makerdao', 'mkr'],
  ['xdai_gnosis', 'xdai'],
  ['gnosis beacon chain', 'gno'],
  ['compound3', 'comp'],
  ['compound v3', 'comp'],
  ['enzyme', 'mln'],
  ['rocket pool', 'reth'],
])

export default function CryptoIcon({ symbol, size }: { symbol: string; size?: number }) {
  let name = symbol.toLowerCase()

  name = SYMLINK.get(name) || name
  const s = size || 16

  const defaultPath = '/images/protocols/default.svg'
  const img = (icons as any)[name] || defaultPath
  return <Image src={img} width={s} height={s} alt={name} priority />
}

import Image from 'next/image'
import { useCallback, useState } from 'react'

const WITH_EXT = new Map<string, string>([
  ['aurabal', 'webp'],
  ['aura', 'png'],
  ['wsteth', 'webp'],
  ['xdai', 'webp'],
  ['eure', 'webp'],
  ['agve', 'webp'],
  ['ageur', 'webp'],
  ['gho', 'webp'],
  ['ldo', 'webp'],
])

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
  const ext = WITH_EXT.get(name) || 'svg'
  const [src, setSrc] = useState(`/images/crypto/color/${name}.${ext}`)
  const fallback = useCallback(() => {
    setSrc('/images/protocols/default.svg')
  }, [])
  return <Image src={src} onError={fallback} width={s} height={s} alt={name} />
}

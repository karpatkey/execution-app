import { AppBlockchain } from 'src/contexts/state'

export type Chain = 'eth' | 'xdai'
type ChainId = 1 | 100

const PAIRS: [AppBlockchain, Chain][] = [
  ['ethereum', 'eth'],
  ['gnosis', 'xdai'],
]

const PAIRSI: [AppBlockchain, ChainId][] = [
  ['ethereum', 1],
  ['gnosis', 100],
]

const AtoC = new Map<AppBlockchain, Chain>(PAIRS)
const CtoA = new Map<Chain, AppBlockchain>(PAIRS.map(([a, b]) => [b, a]))
const AtoI = new Map<AppBlockchain, ChainId>(PAIRSI)

export function appBCtoChain(bc: AppBlockchain): Chain | undefined {
  return AtoC.get(bc.toLowerCase() as AppBlockchain)
}
export function chainToAppB(bc: Chain): AppBlockchain | undefined {
  return CtoA.get(bc)
}

export function chainId(bc: AppBlockchain): ChainId | undefined {
  return AtoI.get(bc)
}

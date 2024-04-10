import { CowswapSigner } from './src/services/cowswap'

const decoded: any = []

const bc = 'ethereum' as any

;(async function () {
  const signer = new CowswapSigner(bc, decoded)
  return await signer.moooIt()
})().then((r) => console.log(r))

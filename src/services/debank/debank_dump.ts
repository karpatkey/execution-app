import fs from 'fs'
import { getPositions } from './debank'

const wallets = [
  '0x849D52316331967b6fF1198e5E32A0eB168D039d',
  '0x4971DD016127F390a3EF6b956Ff944d0E2e1e462',
  '0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C',
  '0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89',
  '0x4F2083f5fBede34C2714aFfb3105539775f7FE64',
  '0x458cD345B4C05e8DF39d0A07220feb4Ec19F5e6f',
  '0x10E4597fF93cbee194F4879f8f1d54a370DB6969',
]

console.log('Getting debank data')
getPositions(wallets).then((data) => {
  console.log(`saving to file`)
  fs.writeFileSync('./debank_out.json', JSON.stringify(data, null, 2))
})

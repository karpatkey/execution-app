export const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID
export const GOOGLE_CREDS = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  project_id: GOOGLE_PROJECT_ID,
  private_key: process.env?.GOOGLE_PRIVATE_KEY?.replace(new RegExp('\\\\n', 'g'), '\n'),
}

export const DATA_WAREHOUSE_ENV = process.env.DATA_WAREHOUSE_ENV || 'production'
export const TITLE = 'karpatkey'

export const enum DAO_NAME_KEY {
  'Gnosis DAO' = 1,
  'Gnosis Ltd' = 2,
  'Balancer DAO' = 3,
  'ENS DAO' = 4,
  'CoW DAO' = 5,
  'karpatkey DAO' = 6,
  'Gnosis Guild' = 7,
  'Lido' = 8,
  'Aave DAO' = 9,
}

export interface DAO {
  id: DAO_NAME_KEY
  name: string
  icon: string
  keyName: string
  sinceMonth: number
  sinceYear: number
  addresses: {
    address: string
    chainId: number
  }[]
}

export const ALL_DAOS = [
  'Gnosis DAO',
  'Gnosis Ltd',
  'Balancer DAO',
  'ENS DAO',
  'CoW DAO',
  'karpatkey DAO',
  'Gnosis Guild',
  'Lido',
  'Aave DAO',
]

export function daoWallets(dao: string): string[] {
  const config = DAO_LIST.find((d) => d.keyName == dao)
  if (!config) return []
  return config.addresses.flatMap((a) => a.address)
}

export const DAO_LIST: DAO[] = [
  {
    id: DAO_NAME_KEY['Gnosis DAO'],
    name: 'Gnosis',
    icon: '/images/protocols/gnosis.svg',
    keyName: 'Gnosis DAO',
    sinceMonth: 1,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x849d52316331967b6ff1198e5e32a0eb168d039d',
        chainId: 1,
      },
      {
        address: '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
        chainId: 100,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['Gnosis Ltd'],
    name: 'Gnosis Ltd',
    icon: '/images/protocols/gnosis.svg',
    keyName: 'Gnosis Ltd',
    sinceMonth: 7,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x4971DD016127F390a3EF6b956Ff944d0E2e1e462',
        chainId: 1,
      },
      {
        address: '0x10E4597fF93cbee194F4879f8f1d54a370DB6969',
        chainId: 100,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['Balancer DAO'],
    name: 'Balancer',
    icon: '/images/protocols/balancer.svg',
    keyName: 'Balancer DAO',
    sinceMonth: 2,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x0efccbb9e2c09ea29551879bd9da32362b32fc89',
        chainId: 1,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['ENS DAO'],
    name: 'ENS',
    icon: '/images/protocols/ens.svg',
    keyName: 'ENS DAO',
    sinceMonth: 3,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x4f2083f5fbede34c2714affb3105539775f7fe64',
        chainId: 1,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['CoW DAO'],
    name: 'CoW Protocol',
    icon: '/images/protocols/cow.svg',
    keyName: 'CoW DAO',
    sinceMonth: 2,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x616de58c011f8736fa20c7ae5352f7f6fb9f0669',
        chainId: 1,
      },
      {
        address: '0x616de58c011f8736fa20c7ae5352f7f6fb9f0669',
        chainId: 100,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['karpatkey DAO'],
    name: 'karpatkey',
    icon: '/images/protocols/karpatkey.svg',
    keyName: 'karpatkey DAO',
    sinceMonth: 1,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c',
        chainId: 1,
      },
      {
        address: '0x54e191B01aA9C1F61AA5C3BCe8d00956F32D3E71',
        chainId: 100,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['Gnosis Guild'],
    name: 'Gnosis Guild',
    icon: '/images/protocols/gnosis.svg',
    keyName: 'Gnosis Guild',
    sinceMonth: 7,
    sinceYear: 2023,
    addresses: [
      // TODO: update theses addresses
      {
        address: '0x3e40d73eb977dc6a537af587d48316fee66e9c8c',
        chainId: 1,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['Lido'],
    name: 'Lido',
    icon: '/images/protocols/lido.svg',
    keyName: 'Lido',
    sinceMonth: 11,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x3e40d73eb977dc6a537af587d48316fee66e9c8c',
        chainId: 1,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['Aave DAO'],
    name: 'Aave',
    icon: '/images/protocols/aave.svg',
    keyName: 'Aave DAO',
    sinceMonth: 12,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c',
        chainId: 1,
      },
      {
        address: '0x25f2226b597e8f9514b3f68f00f494cf4f286491',
        chainId: 1,
      },
      {
        address: '0x205e795336610f5131be52f09218af19f0f3ec60',
        chainId: 1,
      },
      {
        address: '0x3e652e97ff339b73421f824f5b03d75b62f1fb51',
        chainId: 100,
      },
      {
        address: '0x053d55f9b5af8694c503eb288a1b7e552f590710',
        chainId: 42161,
      },
      {
        address: '0xb2289e329d2f85f1ed31adbb30ea345278f21bcf',
        chainId: 10,
      },
      {
        address: '0xe8599f3cc5d38a9ad6f3684cd5cea72f10dbc383',
        chainId: 137,
      },
      {
        address: '0x5ba7fd868c40c16f7adfae6cf87121e13fc2f7a0',
        chainId: 43114,
      },
      {
        address: '0xba9424d650a4f5c80a0da641254d1acce2a37057',
        chainId: 8453,
      },
      {
        address: '0xb5b64c7e00374e766272f8b442cd261412d4b118',
        chainId: 1088,
      },
    ],
  },
]

// # Gnosis DAO
// GNOSISDAO_ETHEREUM_AVATAR_SAFE_ADDRESS = '0x849D52316331967b6fF1198e5E32A0eB168D039d'
// # Gnosis LTD
// GNOSISLTD_ETHEREUM_AVATAR_SAFE_ADDRESS = "0x4971DD016127F390a3EF6b956Ff944d0E2e1e462"
// # karpatkey
// KARPATKEY_ETHEREUM_AVATAR_SAFE_ADDRESS = "0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C"
// # BalancerDAO
// BALANCERDAO_ETHEREUM_AVATAR_SAFE_ADDRESS = "0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89"
// # ENS
// ENS_ETHEREUM_AVATAR_SAFE_ADDRESS = "0x4F2083f5fBede34C2714aFfb3105539775f7FE64"
// # Gnosis DAO
// GNOSISDAO_GNOSIS_AVATAR_SAFE_ADDRESS = "0x458cD345B4C05e8DF39d0A07220feb4Ec19F5e6f"
// # Gnosis LTD
// GNOSISLTD_GNOSIS_AVATAR_SAFE_ADDRESS = "0x10E4597fF93cbee194F4879f8f1d54a370DB6969"
//

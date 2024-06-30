import { Blockchain } from 'src/config/strategies/manager'
import { chainId } from 'src/services/executor/mapper'

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
  'TestSafeDAO' = 10,
}

export interface DAO {
  id: DAO_NAME_KEY
  name: string
  icon: string
  keyName: string
  addresses: {
    address: string
    chainId: number
    manager_roles?: { address: string; role: number }[]
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
  'TestSafeDAO',
]

export function daoWallets(dao: string): string[] {
  const config = DAO_LIST.find((d) => d.keyName == dao)
  if (!config) return []
  return config.addresses.flatMap((a) => a.address)
}

export function daoManagerRole(
  dao: string,
  blockchain: Blockchain,
  connectedWallet?: string,
): { address: string; role: number } | undefined {
  if (!connectedWallet) return undefined

  const chain = chainId(blockchain)
  const config = DAO_LIST.find((d) => d.keyName == dao)
  if (!config) return undefined

  const wallet = config.addresses.find((a) => a.chainId == chain)

  return (wallet?.manager_roles || []).find(
    (mr) => mr.address.toLowerCase() == connectedWallet.toLowerCase(),
  )
}

export const DAO_LIST: DAO[] = [
  {
    id: DAO_NAME_KEY['Gnosis DAO'],
    name: 'Gnosis',
    icon: '/images/protocols/gnosis.svg',
    keyName: 'Gnosis DAO',
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
    addresses: [
      {
        address: '0x4f2083f5fbede34c2714affb3105539775f7fe64',
        chainId: 1,
      },
    ],
  },
  {
    id: DAO_NAME_KEY['karpatkey DAO'],
    name: 'karpatkey',
    icon: '/images/protocols/karpatkey.svg',
    keyName: 'karpatkey DAO',
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
    id: DAO_NAME_KEY['TestSafeDAO'],
    name: 'TestSafeDAO',
    icon: '/images/protocols/karpatkey.svg',
    keyName: 'TestSafeDAO',
    addresses: [
      {
        address: '0xC01318baB7ee1f5ba734172bF7718b5DC6Ec90E1',
        chainId: 1,
      },
      {
        address: '0x25e6bf739efdf0f79656423b592afc4d25f70f20',
        chainId: 100,
        manager_roles: [
          {
            address: '0xD0AD4A2DAbDeaE18A943b8237c9023afD87c9664',
            role: 2,
          },
        ],
      },
    ],
  },
]

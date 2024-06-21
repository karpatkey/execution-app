import { describe, expect, test as it } from '@jest/globals'
import fetchMock from 'jest-fetch-mock'
import createCachingMock from 'jest-fetch-mock-cache'
import Store from 'jest-fetch-mock-cache/lib/stores/nodeFs'
import { getPositions } from './debank'

import { TextEncoder } from 'util'

import webcrypto from 'crypto'

// doing this to make jest-fetch-mock-cache work
// @ts-expect-error: Cannot assign
global.crypto['subtle'] = webcrypto.subtle
global.TextEncoder = TextEncoder

const WALLETS = [{ chainId: 1, address: '0x849D52316331967b6fF1198e5E32A0eB168D039d' }]
fetchMock.enableMocks()
const cachingMock = createCachingMock({ store: new Store() })

describe('debank positions', () => {
  it('get positions', async () => {
    fetchMock.mockImplementation(cachingMock)

    const wallets = [WALLETS[0]]
    const res = await getPositions(wallets)
    expect(res[0].positions[0]).toEqual({
      chain: 'ethereum',
      debank: {
        asset_dict: {
          '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': 889593.7343129165,
          '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 182.34709616294685,
        },
        asset_token_list: [
          {
            amount: 889593.7343129165,
            auto_is_core: false,
            chain: 'eth',
            credit_score: 537440.2147058437,
            decimals: 18,
            display_symbol: null,
            id: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f',
            is_core: true,
            is_scam: false,
            is_suspicious: false,
            is_verified: null,
            is_wallet: true,
            logo_url:
              'https://static.debank.com/image/eth_token/logo_url/0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f/f6cc1d86bdf590208ab77700488d25c3.png',
            name: 'Gho Token',
            optimized_symbol: 'GHO',
            price: 0.9995159348910665,
            price_24h_change: 0.00021576050973901544,
            protocol_id: 'gho',
            symbol: 'GHO',
            time_at: 1689420227,
          },
          {
            amount: 182.34709616294685,
            auto_is_core: false,
            chain: 'eth',
            credit_score: 1165970.9723370022,
            decimals: 18,
            display_symbol: null,
            id: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
            is_core: true,
            is_scam: false,
            is_suspicious: false,
            is_verified: true,
            is_wallet: true,
            logo_url:
              'https://static.debank.com/image/eth_token/logo_url/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9/eee087b66747b09dbfb4ba0b34fd3697.png',
            name: 'Aave Token',
            optimized_symbol: 'AAVE',
            price: 85.17751833371855,
            price_24h_change: -0.03499651944021103,
            protocol_id: 'aave',
            symbol: 'AAVE',
            time_at: 1600970788,
          },
        ],
        detail: {
          reward_token_list: [
            {
              amount: 182.34709616294685,
              auto_is_core: false,
              chain: 'eth',
              credit_score: 1165970.9723370022,
              decimals: 18,
              display_symbol: null,
              id: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
              is_core: true,
              is_scam: false,
              is_suspicious: false,
              is_verified: true,
              is_wallet: true,
              logo_url:
                'https://static.debank.com/image/eth_token/logo_url/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9/eee087b66747b09dbfb4ba0b34fd3697.png',
              name: 'Aave Token',
              optimized_symbol: 'AAVE',
              price: 85.17751833371855,
              price_24h_change: -0.03499651944021103,
              protocol_id: 'aave',
              symbol: 'AAVE',
              time_at: 1600970788,
            },
          ],
          supply_token_list: [
            {
              amount: 889593.7343129165,
              auto_is_core: false,
              chain: 'eth',
              credit_score: 537440.2147058437,
              decimals: 18,
              display_symbol: null,
              id: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f',
              is_core: true,
              is_scam: false,
              is_suspicious: false,
              is_verified: null,
              is_wallet: true,
              logo_url:
                'https://static.debank.com/image/eth_token/logo_url/0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f/f6cc1d86bdf590208ab77700488d25c3.png',
              name: 'Gho Token',
              optimized_symbol: 'GHO',
              price: 0.9995159348910665,
              price_24h_change: 0.00021576050973901544,
              protocol_id: 'gho',
              symbol: 'GHO',
              time_at: 1689420227,
            },
          ],
        },
        detail_types: ['common'],
        name: 'Staked',
        pool: {
          adapter_id: 'aave2_staked',
          chain: 'eth',
          controller: '0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d',
          id: '0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d',
          index: null,
          project_id: 'aave3',
          time_at: 1705510595,
        },
        proxy_detail: {},
        stats: {
          asset_usd_value: 904694.9861515295,
          debt_usd_value: 0,
          net_usd_value: 904694.9861515295,
        },
        update_at: 1718975164.3521497,
      },
      lptoken_name: 'Staked GHO',
      pool_id: '0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d',
      position_type: 'Staked',
      protocol_name: 'Aave V3',
      tokens: [
        {
          amount: 889593.7343129165,
          as: 'supply',
          id: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f',
          price: 0.9995159348910665,
          symbol: 'GHO',
        },
      ],
      updated_at: 1718975164352.1497,
      usd_amount: 904694.9861515295,
    })
  }, 10000)
})

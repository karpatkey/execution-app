import { getPositions } from './debank'

const WALLETS = ['0x849D52316331967b6fF1198e5E32A0eB168D039d']

const responses = new Map([[WALLETS[0], require(`./test_fixtures/${WALLETS[0]}.json`)]])

describe('debank positions', () => {
  it('get positions', async () => {
    const wallets = [WALLETS[0]]
    // const params = ['--wallets', wallets.join(',')]
    // const { data, error } = await dBankPromise(params)
    //
    global.fetch = jest.fn(() => {
      const response = responses.get(wallets[0])

      return Promise.resolve({
        json: () => Promise.resolve(response),
      })
    }) as jest.Mock

    const res = await getPositions(wallets)
    expect(res[0].positions).toContainEqual([
      {
        chain: 'ethereum',
        pool_id: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',
        position_type: 'Aave V3',
        protocol_name: 'Aave V3',
        tokens: [
          {
            amount: 2088.089582112845,
            as: 'supply',
            chain: 'eth',
            price: 3789.4886705334557,
            symbol: 'stETH',
          },
          {
            amount: 25.50626561,
            as: 'borrow',
            chain: 'eth',
            price: 66846.2,
            symbol: 'WBTC',
          },
          {
            amount: 0.152691,
            as: 'borrow',
            chain: 'eth',
            price: 1,
            symbol: 'USDC',
          },
          {
            amount: 1.3422671774e-8,
            as: 'borrow',
            chain: 'eth',
            price: 0.9915074246010225,
            symbol: 'GHO',
          },
        ],
        wallet: '0x849D52316331967b6fF1198e5E32A0eB168D039d',
      },
    ])
  })
})

// it.skip('same for 1 wallet', async () => {
//   const wallets = ['0x849D52316331967b6fF1198e5E32A0eB168D039d']
//   const params = ['--wallets', wallets.join(',')]
//   const { data, error } = await dBankPromise(params)
//
//   expect(error).toBe(undefined)
//   const res = await getPositions(wallets)
//   expect(res[0].positions[0][0]).toBe(data[0])
// })

// describe.skip('transformPosition', () => {
//   const params = [
//     [['Aura', 'Locked', 'eth', null, 'auraBAL'], ''],
//     [['Aura', 'Locked', 'eth', null, 'AURA'], ''],
//     [['Aura', 'Farming', 'eth', 'aura50COW-50GNO-vault', 'GNO'], ''],
//     [['Aura', 'Farming', 'eth', 'aura50COW-50GNO-vault', 'COW'], ''],
//     [['Aura', 'Farming', 'eth', 'auraB-auraBAL-STABLE-vault', 'BAL'], ''],
//     [['Aura', 'Farming', 'eth', 'auraB-auraBAL-STABLE-vault', 'AURA'], ''],
//     [['Aura', 'Farming', 'eth', 'auraB-auraBAL-STABLE-vault', 'BAL'], ''],
//     [['Aura', 'Farming', 'eth', 'auraB-auraBAL-STABLE-vault', 'ETH'], ''],
//     [['Aura', 'Farming', 'eth', 'auraB-auraBAL-STABLE-vault', 'auraBAL'], ''],
//     [['Aura', 'Farming', 'eth', 'aura50COW-50WETH-vault', 'ETH'], ''],
//     [['Aura', 'Farming', 'eth', 'aura50COW-50WETH-vault', 'COW'], ''],
//     [['Aura', 'Farming', 'eth', 'rETH-WETH', 'BAL'], ''],
//     [['Aura', 'Farming', 'eth', 'rETH-WETH', 'AURA'], ''],
//     [['Aura', 'Farming', 'eth', 'rETH-WETH', 'ETH'], ''],
//     [['Aura', 'Yield', 'eth', 'stkauraBAL', 'AURA'], ''],
//     [['Aura', 'Yield', 'eth', 'stkauraBAL', 'auraBAL'], ''],
//     [['Balancer', 'Locked', 'eth', null, 'BAL'], ''],
//     [['Balancer', 'Locked', 'eth', null, 'ETH'], ''],
//     [['Balancer', 'Rewards', 'eth', null, 'BAL'], ''],
//     [['Balancer', 'Rewards', 'eth', null, 'USDC'], ''],
//     [['Balancer', 'Liquidity Pool', 'eth', null, 'DAI'], ''],
//     [['Balancer', 'Liquidity Pool', 'eth', null, 'USDT'], ''],
//     [['Balancer', 'Liquidity Pool', 'eth', null, 'USDC'], ''],
//     [['Lido', 'Staked', 'eth', 'wstETH', 'ETH'], 'wstETH'],
//     [['Lido', 'Staked', 'eth', 'stETH', 'ETH'], 'stETH']
//   ]
//
//   params.map(([[protocol_name, position_type, chain, position, symbol], expected]) => {
//     it(`works for '${protocol_name}' '${position_type}' '${chain}' '${position}' '${symbol}'`, () => {
//       const p = { protocol_name, position_type, chain, position, symbol }
//       const pos = transformPosition(p)
//       expect(pos).toBe(expected, p)
//     })
//   })
// })

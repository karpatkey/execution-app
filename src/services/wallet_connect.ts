import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId
const projectId = 'be0ec3f4c5e6dbb27cb1d33f4d82ca4f'

// 2. Set chains

// 3. Create a metadata object
const metadata = {
  name: 'kpk AxA',
  description: 'Karpatkey Execution App',
  url: 'https://agile.karpatkey.com', // origin must match your domain & subdomain
  icons: ['https://agile.karpatkey.dev/favicons/favicon-32x32.png'],
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  // rpcUrl: '...', // used for the Coinbase SDK
  // defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  themeVariables: {
    '--w3m-font-family': 'var(--font-mono)',
    '--w3m-color-mix': '#55556FFF',
    '--w3m-color-mix-strength': 50,
    '--w3m-accent': '#191A21FF',
  },
  chains: [
    {
      chainId: 1,
      name: 'Ethereum',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://cloudflare-eth.com',
    },
    {
      chainId: 100,
      name: 'Gnosis',
      currency: 'xDAI',
      explorerUrl: 'https://gnosisscan.io',
      rpcUrl: 'https://gnosis-rpc.publicnode.com',
    },
  ],
  projectId,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
})

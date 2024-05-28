import { Box } from '@mui/material'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, formatUnits } from 'ethers'
import { useEffect, useState } from 'react'
import 'src/services/wallet_connect'

export function WalletConnect() {
  return (
    <Box sx={{ marginRight: '1rem' }}>
      <w3m-button balance="show" size="sm" />
    </Box>
  )
}

export function Balance() {
  const { isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [balance, setBalance] = useState<string>()

  useEffect(() => {
    ;(async () => {
      if (!isConnected) return null
      if (!walletProvider) return null

      const ethersProvider = new BrowserProvider(walletProvider)
      const signer = await ethersProvider.getSigner()
      // The Contract object
      // const USDTContract = new Contract(USDTAddress, USDTAbi, signer)
      // const USDTBalance = await USDTContract.balanceOf(address)
      const balance = await ethersProvider.getBalance(signer.address)

      const b = formatUnits(balance, 18)
      setBalance(b)
    })()
  }, [isConnected, walletProvider])

  return <>{balance}</>
}

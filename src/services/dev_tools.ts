import { ethers, JsonRpcProvider } from 'ethers'

function toHex32Bytes(value: string | number) {
  return ethers.toBeHex(value, 32)
}

function drop0x(value: string) {
  return value.substring(2, value.length)
}

export class AnvilTools {
  provider: JsonRpcProvider

  constructor(provider: JsonRpcProvider) {
    this.provider = provider
  }

  async impersonate(address: string) {
    return await this.provider.send('anvil_impersonateAccount', [address])
  }

  async stopImpersonate(address: string) {
    return await this.provider.send('anvil_stopImpersonatingAccount', [address])
  }

  async topUpAddress(address: string) {
    return await this.provider.send('anvil_setBalance', [address, '0x021e19e0c9bab2400000'])
  }
  async mine() {
    return await this.provider.send('anvil_mine', [])
  }

  async assignRole({
    avatar_safe_address,
    roles_mod_address,
    role,
    assignee,
  }: {
    avatar_safe_address: string
    roles_mod_address: string
    role: number
    assignee: string
  }) {
    try {
      const asignee_32_bytes = toHex32Bytes(assignee)
      const role_32_bytes = toHex32Bytes(role)
      const calldata_to_assign_role = [
        '0xa6edf38f',
        `${drop0x(asignee_32_bytes)}`,
        '0000000000000000000000000000000000000000000000000000000000000060',
        '00000000000000000000000000000000000000000000000000000000000000a0',
        '0000000000000000000000000000000000000000000000000000000000000001',
        `${drop0x(role_32_bytes)}`,
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000001',
      ].join('')

      const tx_assignRole = {
        from: avatar_safe_address,
        to: roles_mod_address,
        data: calldata_to_assign_role,
        value: '0',
      }

      await this.impersonate(avatar_safe_address)
      // The amount of ETH of the Avatar address is increased
      await this.topUpAddress(avatar_safe_address)

      const signer = await this.provider.getSigner(avatar_safe_address)
      const tx = await signer.sendTransaction(tx_assignRole)
      await this.mine()
      await this.stopImpersonate(avatar_safe_address)
      return await tx.wait()
    } catch (e) {
      console.error('ERROR in assignRole', e)
      throw e
    }
  }
}

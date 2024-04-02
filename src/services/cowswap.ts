import { Blockchain } from 'src/config/strategies/manager'
import { Chain, createOrder } from './cowswap/api'
import { appBCtoChain } from './executor/mapper'

interface Component {
  name: string
  type: 'address' | 'uint256' | 'uint32' | 'bytes32' | 'bool'
}

type Value = string | number

type Input =
  | {
      name: string
      type: 'tuple'
      components: Component[]
      value: Value[]
    }
  | {
      name: string
      type: 'uint256' | 'uint32'
      value: number
    }

type Address = string

interface DecodedTransactionStep {
  name: string
  type: 'function' | ''
  inputs: Input[]
  outputs: any
  to_address: Address
  value: number
  data: string
  from_address: Address
}

function parseTupleInput(components: Component[], value: Value[]): any {
  return components.reduce((res, comp, index) => {
    return { ...res, [comp.name]: value[index] }
  }, {})
}

export class CowswapSigner {
  chain: Chain
  decodedTx: DecodedTransactionStep[]

  constructor(bc: Blockchain, decodedTransaction: DecodedTransactionStep[]) {
    const chain = appBCtoChain(bc)
    if (!chain) throw new Error('Error, invalid chain')

    this.chain = chain
    this.decodedTx = decodedTransaction
  }

  needsMooofirmation() {
    return this.getOrders().length > 0
  }

  getOrders() {
    return this.decodedTx.filter((step) => step.name == 'signOrder')
  }

  async moooIt() {
    return await Promise.all(this.getOrders().map(this.processOrder.bind(this)))
  }

  private async processOrder(order: DecodedTransactionStep) {
    const args = this.argsFromOrder(order)
    return await createOrder(this.chain, args)
  }

  private argsFromOrder(order: DecodedTransactionStep) {
    const input = order.inputs.find((input) => input.name == 'order' && input.type == 'tuple')

    if (input?.type != 'tuple') {
      // Should never happen... But TS...
      throw new Error('No valid order input found')
    }

    const values = parseTupleInput(input.components, input.value)

    // TODO review if we can remove hardcoded values
    return {
      sellToken: values.sell_token,
      buyToken: values.buy_token,
      receiver: values.receiver,
      sellAmount: '' + values.sell_amount,
      buyAmount: '' + values.buy_amount,
      validTo: values.valid_to,
      feeAmount: '0' || values.fee_amount,
      kind: 'sell',
      partiallyFillable: values.partially_fillable,
      sellTokenBalance: 'erc20',
      signingScheme: 'presign',
      signature: '0x',
      // In our case from is the same as receiver. 'from' is not part part of decoded tx
      from: values.receiver,
    }
  }
}

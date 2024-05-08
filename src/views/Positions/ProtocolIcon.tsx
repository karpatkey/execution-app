import * as React from 'react'
import Aave from 'src/components/Assets/Icons/Protocols/Aave'
import AaveV3 from 'src/components/Assets/Icons/Protocols/AaveV3'
import Agave from 'src/components/Assets/Icons/Protocols/Agave'
import Angle from 'src/components/Assets/Icons/Protocols/Angle'
import Ankr from 'src/components/Assets/Icons/Protocols/Ankr'
import Aura from 'src/components/Assets/Icons/Protocols/Aura'
import Azuro from 'src/components/Assets/Icons/Protocols/Azuro'
import Balancer from 'src/components/Assets/Icons/Protocols/Balancer'
import Bancor from 'src/components/Assets/Icons/Protocols/Bancor'
import CoW from 'src/components/Assets/Icons/Protocols/CoW'
import Compound from 'src/components/Assets/Icons/Protocols/Compound'
import Connext from 'src/components/Assets/Icons/Protocols/Connext'
import Convex from 'src/components/Assets/Icons/Protocols/Convex'
import Curve from 'src/components/Assets/Icons/Protocols/Curve'
import Element from 'src/components/Assets/Icons/Protocols/Element'
import HoneySwap from 'src/components/Assets/Icons/Protocols/HoneySwap'
import Idle from 'src/components/Assets/Icons/Protocols/Idle'
import Lido from 'src/components/Assets/Icons/Protocols/Lido'
import Maker from 'src/components/Assets/Icons/Protocols/Maker'
import Notional from 'src/components/Assets/Icons/Protocols/Notional'
import Pods from 'src/components/Assets/Icons/Protocols/Pods'
import Spark from 'src/components/Assets/Icons/Protocols/Spark'
import StakeWise from 'src/components/Assets/Icons/Protocols/StakeWise'
import SushiSwap from 'src/components/Assets/Icons/Protocols/SushiSwap'
import Swapr from 'src/components/Assets/Icons/Protocols/Swapr'
import UniswapV3 from 'src/components/Assets/Icons/Protocols/UniswapV3'
import Validators from 'src/components/Assets/Icons/Protocols/Validators'
import CryptoIcon from 'src/components/CryptoIcon'

interface ProtocolIconProps {
  protocol: string
}

const ProtocolIcon = (props: ProtocolIconProps) => {
  const { protocol } = props

  let icon: Maybe<React.ReactElement> = null

  switch (protocol) {
    case 'Aave':
      icon = <Aave width={24} height={24} />
      break
    case 'AaveV3':
      icon = <AaveV3 width={24} height={24} />
      break
    case 'Angle':
      icon = <Angle width={24} height={24} />
      break
    case 'Azuro':
      icon = <Azuro width={24} height={24} />
      break
    case 'Ankr':
      icon = <Ankr width={24} height={24} />
      break
    case 'Agave':
      icon = <Agave width={24} height={24} />
      break
    case 'Aura':
      icon = <Aura width={24} height={24} />
      break
    case 'Balancer':
      icon = <Balancer width={24} height={24} />
      break
    case 'Idle':
      icon = <Idle width={24} height={24} />
      break
    case 'Element':
      icon = <Element width={24} height={24} />
      break
    case 'Bancor':
      icon = <Bancor width={24} height={24} />
      break
    case 'Connext':
      icon = <Connext width={24} height={24} />
      break
    case 'Curve':
      icon = <Curve width={24} height={24} />
      break
    case 'CompoundV3':
      icon = <Compound width={24} height={24} />
      break
    case 'Compound V2':
      icon = <Compound width={24} height={24} />
      break
    case 'Convex':
      icon = <Convex width={24} height={24} />
      break
    case 'Honeyswap':
      icon = <HoneySwap width={24} height={24} />
      break
    case 'Lido':
      icon = <Lido width={24} height={24} />
      break
    case 'Maker':
      icon = <Maker width={24} height={24} />
      break
    case 'CoW':
      icon = <CoW width={24} height={24} />
      break
    case 'Notional':
      icon = <Notional width={24} height={24} />
      break
    case 'Pods':
      icon = <Pods width={24} height={24} />
      break
    case 'Swapr':
      icon = <Swapr width={24} height={24} />
      break
    case 'Spark':
      icon = <Spark width={24} height={24} />
      break
    case 'SushiSwap':
      icon = <SushiSwap width={24} height={24} />
      break
    case 'Stakewise':
      icon = <StakeWise width={24} height={24} />
      break
    case 'Validators (GC)':
      icon = <Validators width={24} height={24} />
      break
    case 'UniswapV3':
      icon = <UniswapV3 width={24} height={24} />
      break
  }

  return icon || <CryptoIcon symbol={protocol} size={24} />
}

export default ProtocolIcon

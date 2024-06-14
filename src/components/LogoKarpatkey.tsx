import { Box } from '@mui/material'
import Image from 'next/image'
import Link from 'src/components/Link'

const LogoKarpatkey = () => (
  <Box alignItems="center" display="flex" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
    <Link href="/positions">
      <Image alt="logo" src="/images/logos/logo1.png" priority width={102} height={21} />
    </Link>
  </Box>
)

export default LogoKarpatkey

import { Box } from '@mui/material'
import NextImage from 'next/image'
import Link from 'src/components/Link'

const LogoKarpatkey = () => (
  <Box alignItems="center" display="flex" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
    <Link href="/">
      <NextImage alt="logo" src="/images/logos/logo1.png" width={102} height={21} />
    </Link>
  </Box>
)

export default LogoKarpatkey

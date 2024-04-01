import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useApp } from 'src/contexts/app.context'

export const DAOFilter = () => {
  const { state } = useApp()
  const daos = state.daos
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement>, value: any) => {
      const term = value
      const params = new URLSearchParams(searchParams.toString())
      if (term && term != 'All') {
        params.set('dao', term)
      } else {
        params.delete('dao')
      }

      const p = params.toString()
      const uri = p ? `${pathname}?${p}` : pathname
      router.replace(uri)
    },
    [pathname, router, searchParams],
  )

  const selectedDao = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.get('dao') || daos[0]
  }, [daos, searchParams])

  return (
    <ToggleButtonGroup
      color="primary"
      value={selectedDao}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      sx={{ margin: '25px 48px' }}
    >
      {daos.map((option: string, index: number) => {
        return (
          <ToggleButton key={index} value={option} disabled={daos.length === 1}>
            {option}
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

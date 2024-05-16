import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { useApp } from 'src/contexts/app.context'

import { slug } from 'src/utils/string'

export const DAOFilter = () => {
  const { state } = useApp()
  const daos = state.daos
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleChange = useCallback(
    (_e: React.MouseEvent<HTMLElement>, value: any) => {
      const term = value
      const params = new URLSearchParams(searchParams.toString())
      if (term && term != 'all') {
        params.set('dao', slug(term))
      } else {
        params.delete('dao')
      }

      const p = params.toString()
      const uri = p ? `${pathname}?${p}` : pathname
      router.push(uri, undefined, { shallow: true })
    },
    [pathname, router, searchParams],
  )

  const options = useMemo(() => (daos.length > 1 ? ['All', ...daos] : daos), [daos])

  const selectedDao = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.get('dao') || slug(options[0])
  }, [options, searchParams])

  return (
    <ToggleButtonGroup
      color="primary"
      value={selectedDao}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      sx={{ margin: '25px 48px' }}
    >
      {options.map((option: string, index: number) => {
        return (
          <ToggleButton key={index} value={slug(option)} disabled={daos.length === 1}>
            {option}
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

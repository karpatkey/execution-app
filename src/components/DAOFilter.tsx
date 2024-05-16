import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
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

  const allDaos = 'all'

  const handleChange = useCallback(
    (e: SelectChangeEvent) => {
      const term = e.target.value
      const params = new URLSearchParams(searchParams.toString())
      if (term && term != allDaos) {
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
    return params.get('dao') || slug(options[0] || allDaos)
  }, [options, searchParams])

  return (
    <FormControl size="small" sx={{ marginRight: '2rem' }}>
      <InputLabel id="dao-selector-label">Dao</InputLabel>
      <Select
        labelId="dao-selector-label"
        id="dao-selector"
        color="primary"
        value={selectedDao}
        label="Dao"
        onChange={handleChange}
      >
        {options.map((option: string, index: number) => {
          return (
            <MenuItem key={index} value={slug(option)}>
              {option}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { CHAINS } from 'src/config/strategies/manager'

export const ChainFilter = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const all = 'all'

  const handleChange = useCallback(
    (e: SelectChangeEvent) => {
      const term = e.target.value
      const params = new URLSearchParams(searchParams.toString())
      if (term && term != all) {
        params.set('chain', term)
      } else {
        params.delete('chain')
      }

      const p = params.toString()
      const uri = p ? `${pathname}?${p}` : pathname
      router.push(uri, undefined, { shallow: true })
    },
    [pathname, router, searchParams],
  )

  const options = useMemo(() => (CHAINS.length > 1 ? ['All', ...CHAINS] : CHAINS), [])

  const selectedChain = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.get('chain') || options[0]
  }, [options, searchParams])

  return (
    <FormControl size="small" sx={{ marginRight: '2rem' }}>
      <InputLabel id="chain-selector-label">Chain</InputLabel>
      <Select
        labelId="chain-selector-label"
        id="chain-selector"
        color="primary"
        defaultValue={selectedChain.toLowerCase()}
        label="Chain"
        onChange={handleChange}
      >
        {options.map((option: string, index: number) => {
          return (
            <MenuItem key={index} value={option.toLowerCase()}>
              {option}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

import { SearchOutlined } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { DAOFilter } from 'src/components/DAOFilter'
import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import Loading from 'src/components/Loading'
import PaperSection from 'src/components/PaperSection'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { usePositions } from 'src/queries/positions'
import List from 'src/views/Positions/List'

interface SearchPositionProps {
  onChange: (value: string) => void
  value: string
}

const Search = (props: SearchPositionProps) => {
  return (
    <TextField
      size="small"
      sx={{ width: '600px', maxWidth: '80vw' }}
      variant="outlined"
      onChange={(e) => props.onChange(e.target.value)}
      placeholder="Search position"
      defaultValue={props.value}
      InputProps={{
        endAdornment: (
          <IconButton>
            <SearchOutlined />
          </IconButton>
        ),
      }}
    />
  )
}

const SearchPosition = React.memo(Search)

import { useDebounceCallback } from 'usehooks-ts'

const WrapperPositions = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const positions = usePositions()
  const { isFetched } = positions

  const query = searchParams.get('query') || ''

  const updateUrl = useDebounceCallback((uri) => {
    router.push(uri)
  }, 200)

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('query', term)
      } else {
        params.delete('query')
      }

      const p = params.toString()
      const uri = p ? `${pathname}?${p}` : pathname
      updateUrl(uri)
    },
    [pathname, searchParams, updateUrl],
  )

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {!isFetched ? (
          <Loading fullPage />
        ) : (
          <BoxWrapperColumn>
            <BoxWrapperRow sx={{ justifyContent: 'flex-end' }}>
              <DAOFilter />
            </BoxWrapperRow>
            <PaperSection title="Positions">
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <SearchPosition value={query} onChange={handleSearch} />
              </BoxWrapperRow>
              <List />
            </PaperSection>
          </BoxWrapperColumn>
        )}
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

const WrapperPositionsMemoized = React.memo(WrapperPositions)

export default WrapperPositionsMemoized

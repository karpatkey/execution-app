import { SearchOutlined } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import Loading from 'src/components/Loading'
import PaperSection from 'src/components/PaperSection'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { useApp } from 'src/contexts/app.context'
import { PositionWithStrategies } from 'src/contexts/state'
import { usePositions } from 'src/queries/positions'
import { getStrategy } from 'src/services/strategies'
import { slug } from 'src/utils/string'
import { useDebounceCallback } from 'usehooks-ts'
import ExitAllButton from './ExitAllButton'
import List from './List'
import ProtocolFilter from './ProtocolFilter'

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

const sorter = (a: PositionWithStrategies, b: PositionWithStrategies) => {
  if (a.isActive && !b.isActive) return -1
  if (!a.isActive && b.isActive) return 1

  return b.usd_amount - a.usd_amount
}

const WrapperPositions = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { data: positions, isFetched } = usePositions()
  const {
    state: { daosConfigs },
  } = useApp()

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

  const positionsWithStrategies: PositionWithStrategies[] = useMemo(() => {
    return (positions || []).map((position) => {
      const strategies = getStrategy(daosConfigs, position)
      return {
        ...position,
        strategies,
        isActive: !!strategies.positionConfig.find((s) => s.stresstest),
      }
    })
  }, [daosConfigs, positions])

  const queryTerms = useMemo(() => {
    return (searchParams.get('query') || '')
      .toLowerCase()
      .split(' ')
      .filter((s) => s)
  }, [searchParams])

  const all = 'all'
  const filteredChainAndDao = useMemo(() => {
    const dao = searchParams.get('dao') || all
    const chain = searchParams.get('chain') || all

    const withDao =
      dao != all
        ? positionsWithStrategies.filter((position) => slug(position.dao) == dao)
        : positionsWithStrategies

    const withChain =
      chain != all ? withDao.filter((position) => position.blockchain == chain) : withDao

    if (queryTerms.length == 0) {
      return withChain
    } else {
      return withChain.filter((position) => {
        const joined = [position.lptokenName, position.pool_id].join(' ').toLowerCase()
        return !queryTerms.find((t) => joined.search(t) == -1)
      })
    }
  }, [positionsWithStrategies, queryTerms, searchParams])

  const filteredPositions = useMemo(() => {
    const protocol = searchParams.get('protocol') || all

    const withProtocol =
      protocol != 'all'
        ? filteredChainAndDao.filter((position) => position.protocol == protocol)
        : filteredChainAndDao

    return withProtocol.sort(sorter)
  }, [filteredChainAndDao, searchParams])

  const filtersKey = `${searchParams.get('dao')}${searchParams.get('chain')}`

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {!isFetched ? (
          <Loading fullPage />
        ) : (
          <BoxWrapperColumn>
            <PaperSection>
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <SearchPosition value={query} onChange={handleSearch} />
              </BoxWrapperRow>
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <ProtocolFilter positions={filteredChainAndDao} />
                <ExitAllButton positions={filteredPositions} />
              </BoxWrapperRow>
              <List key={filtersKey} positions={filteredPositions} />
            </PaperSection>
          </BoxWrapperColumn>
        )}
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

const WrapperPositionsMemoized = React.memo(WrapperPositions)

export default WrapperPositionsMemoized

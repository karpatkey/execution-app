import { Box, Button } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { PositionWithStrategies } from 'src/contexts/state'
import { slug } from 'src/utils/string'
import { Modal } from 'src/views/Position/Modal/Modal'
import Card from 'src/views/Positions/Card'

function NoPositions() {
  return (
    <Box>
      <h3>No Positions for the selection</h3>
    </Box>
  )
}

export default function List({ positions }: { positions: PositionWithStrategies[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showDisabled, setShowDisabled] = useState(false)

  const selectedPositions = useMemo(() => {
    const selector = searchParams.get('position')
    if (selector) {
      if (selector == 'all') return positions.filter((p) => p.isActive)

      const [dao, blockchain, pool_id] = selector.split(';')
      return positions.filter(
        (pos) => pos.pool_id == pool_id && pos.blockchain == blockchain && slug(pos.dao) == dao,
      )
    } else {
      return undefined
    }
  }, [positions, searchParams])

  const handleModalClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('position')

    const p = params.toString()
    const uri = p ? `${router.pathname}?${p}` : router.pathname
    router.push(uri, undefined, { shallow: true })
  }, [router, searchParams])

  const hasDisabled = useMemo(() => positions.find((p) => !p.isActive), [positions])

  if (!positions || positions.length == 0) return <NoPositions />

  return (
    <>
      {selectedPositions && selectedPositions.length > 0 ? (
        <Modal positions={selectedPositions} open handleClose={handleModalClose} />
      ) : null}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px 20px',
        }}
      >
        {positions
          .filter((p) => showDisabled || p.isActive)
          .map((position, index) => {
            return (
              <Box
                key={index}
                sx={{
                  width: '380px',
                  minHeight: '140px',
                  padding: '12px 12px',
                  border: '1px solid #B6B6B6',
                  background: 'background.paper',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <Card id={index} key={index} position={position} />
              </Box>
            )
          })}
        {hasDisabled ? (
          <Box
            sx={{
              margin: '4rem',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              cursor: 'pointer',
            }}
          >
            <Button
              key="showDisabled"
              variant="contained"
              color="secondary"
              onClick={() => setShowDisabled(!showDisabled)}
            >
              {showDisabled ? 'Hide disabled' : 'Show disabled'}
            </Button>
          </Box>
        ) : null}
      </Box>
    </>
  )
}

import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import EmptyData from 'src/components/EmptyData'
import { PositionWithStrategies } from 'src/contexts/state'
import { slug } from 'src/utils/string'
import { Modal } from 'src/views/Position/Modal/Modal'
import Card from 'src/views/Positions/Card'

export default function List({ positions }: { positions: PositionWithStrategies[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showDisabled, setShowDisabled] = useState(false)

  const selectedPosition = useMemo(() => {
    const id = searchParams.get('position')
    if (id) {
      const [dao, blockchain, pool_id] = id.split(';')
      return positions.find(
        (pos) => pos.pool_id == pool_id && pos.blockchain == blockchain && slug(pos.dao) == dao,
      )
    }
  }, [positions, searchParams])

  const handleModalClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('position')

    const p = params.toString()
    const uri = p ? `${router.pathname}?${p}` : router.pathname
    router.push(uri, undefined, { shallow: true })
  }, [router, searchParams])

  if (!positions) return <EmptyData />

  return (
    <>
      {selectedPosition ? (
        <Modal position={selectedPosition} open handleClose={handleModalClose} />
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
        <Box
          key="showDisabled"
          sx={{
            width: '380px',
            height: '100px',
            margin: '4rem',
            border: '1px solid #333',
            background: '#fff',
            borderRadius: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            cursor: 'pointer',
          }}
          onClick={() => setShowDisabled(!showDisabled)}
        >
          {showDisabled ? 'Hide disabled' : 'Show disabled'}
        </Box>
      </Box>
    </>
  )
}

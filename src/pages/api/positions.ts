import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { authorizedDao } from 'src/services/autorizer'
import { getPositions } from 'src/services/positions'

type Status = {
  data?: any
  error?: string
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>,
) {
  // Should be a get request
  if (req.method !== 'GET')
    return res.status(405).json({ data: { status: false, error: new Error('Method not allowed') } })

  const { error, daos } = await authorizedDao({ req, res })
  if (error) return res.status(401).json({ data: { status: false, error } })

  if (!daos || daos.length == 0)
    return res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })

  try {
    const { data, error } = await getPositions(daos)

    if (error) {
      return res.status(500).json({ error })
    }

    return res.status(200).json({ data, error })
  } catch (error) {
    console.error('ERROR Reject: ', error)
  }

  return res.status(500).json({ error: 'Internal Server Error' })
})

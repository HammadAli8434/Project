import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { healthLogger as log } from '../utils/logger.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    log.debug(
      {
        event: 'health.check',
        requestId: req.id,
      },
      'Health check requested'
    )

    const response = {
      success: true,
      data: {
        status: 'ok',
        service: 'notes-api',
        timestamp: new Date().toISOString(),
      },
    }

    log.info(
      {
        event: 'health.ok',
        requestId: req.id,
      },
      'Service is healthy'
    )

    res.json(response)
  })
)

export default router

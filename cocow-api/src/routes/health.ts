import { Router } from 'express'

const router = Router()

// Health check
router.get('/', (req, res) => {
  res.json({ status: 'ok' })
})

export default router

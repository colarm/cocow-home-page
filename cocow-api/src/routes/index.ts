import { Router } from 'express'
import healthRouter from './health.js'
import categoriesRouter from './categories.js'
import websitesRouter from './websites.js'
import searchRouter from './search.js'

const router = Router()

// Mount all routes
router.use('/health', healthRouter)
router.use('/categories', categoriesRouter)
router.use('/websites', websitesRouter)
router.use('/search', searchRouter)

export default router

import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

// Get all websites
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query
    
    const where: any = {}
    if (category) {
      where.categoryId = category as string
    }
    if (featured === 'true') {
      where.isFeatured = true
    }
    
    const websites = await prisma.website.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
    
    res.json(websites)
  } catch (error) {
    console.error('Error fetching websites:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get website by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const website = await prisma.website.findUnique({
      where: { id },
      include: { category: true }
    })
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' })
    }
    
    res.json(website)
  } catch (error) {
    console.error('Error fetching website:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

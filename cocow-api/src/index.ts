import express from 'express'
import apiRouter from './routes/index.js'

const app = express()
const port = 3001

app.use(express.json())

// Mount API v1 routes
app.use('/api/v1', apiRouter)

app.listen(port, () => console.log(`API running on port ${port}`))


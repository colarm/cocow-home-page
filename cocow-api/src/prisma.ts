import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://cocow_user:cocow_pass@localhost:5432/cocow'

const pool = new pg.Pool({ 
  connectionString,
  // Ensure password is properly parsed as string
  password: String(new URL(connectionString).password)
})
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

export default prisma

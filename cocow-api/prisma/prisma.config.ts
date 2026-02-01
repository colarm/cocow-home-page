/// <reference types="node" />

const databaseUrl = process.env.DATABASE_URL || 'postgresql://cocow_user:cocow_pass@localhost:5432/cocow'

export default {
  datasource: {
    url: databaseUrl
  }
}

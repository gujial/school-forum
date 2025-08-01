import { defineEventHandler } from 'h3'
import { useDatabase } from '../util/database'

export default defineEventHandler(async () => {
  const db = useDatabase();
  const { rows } = await db.sql`SELECT * FROM Tweets ORDER BY created_at DESC LIMIT 20`;

  return {
    data: rows
  }
})

import { neon } from "@neondatabase/serverless"

// Create a singleton database client
const sql = neon(process.env.DATABASE_URL!)

export { sql }

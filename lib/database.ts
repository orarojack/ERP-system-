import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "electronic_shop_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Database connected successfully")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return { success: true, data: results }
  } catch (error) {
    console.error("Database query error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get connection for transactions
export async function getConnection() {
  return await pool.getConnection()
}

export default pool

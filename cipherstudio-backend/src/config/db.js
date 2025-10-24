const mongoose = require("mongoose")

let dbStatus = {
  connected: false,
  lastError: null,
}

// Attempt to connect; on failure, keep the server alive and retry in background.
const connectDB = async (retries = 10, delayMs = 2000) => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    const msg = "MONGODB_URI is not set in environment"
    console.error(`[DB] ${msg}`)
    dbStatus.lastError = msg
    // Don't exit; allow the app to serve health/CORS while env is fixed
    return
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    dbStatus.connected = true
    dbStatus.lastError = null
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    dbStatus.connected = false
    dbStatus.lastError = error?.message || String(error)
    console.error(`[DB] Connection error: ${dbStatus.lastError}`)
    if (retries > 0) {
      const nextDelay = Math.min(Math.floor(delayMs * 1.5), 30000)
      console.log(`[DB] Retrying in ${delayMs} ms... (${retries} retries left)`) 
      setTimeout(() => connectDB(retries - 1, nextDelay), delayMs)
    } else {
      console.error("[DB] Max retries reached. Will rely on Mongoose auto-reconnect.")
    }
  }
}

const getDBStatus = () => ({ ...dbStatus, readyState: mongoose.connection.readyState })

module.exports = { connectDB, getDBStatus }

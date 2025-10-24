const express = require("express")
const cors = require("cors")
require("dotenv").config()

const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")

const app = express()

// CORS configuration for production (temporarily allow all origins for debugging)
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: false, // Disable credentials since not used
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
  optionsSuccessStatus: 200
}

// Handle preflight for all routes
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

module.exports = app

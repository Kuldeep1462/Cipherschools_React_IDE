const express = require("express")
const cors = require("cors")
require("dotenv").config()

const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")

const app = express()

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

module.exports = app

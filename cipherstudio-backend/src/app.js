const express = require("express")
const cors = require("cors")
require("dotenv").config()

const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")

const app = express()

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      'https://cipherschools-react-k2krpnmzv.vercel.app'
    ].filter(Boolean)
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
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

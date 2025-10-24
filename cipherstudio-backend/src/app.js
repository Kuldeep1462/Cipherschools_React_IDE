const express = require("express")
const cors = require("cors")
require("dotenv").config()

const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")
const { getDBStatus } = require("./config/db")

const app = express()

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://cipherschoolside.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, change to callback(new Error('Not allowed by CORS')) in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}

// Handle preflight for all routes
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

// Additional CORS headers middleware as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, user-id, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

// Root route to help default platform health checks (200 OK)
app.get('/', (req, res) => {
  res.status(200).send('CipherStudio backend running')
})

app.get("/api/health", (req, res) => {
  const db = getDBStatus ? getDBStatus() : { connected: null, lastError: null }
  res.json({ status: "ok", db })
})

module.exports = app

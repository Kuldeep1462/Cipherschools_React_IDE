const express = require("express")
const cors = require("cors")
require("dotenv").config()

const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

module.exports = app

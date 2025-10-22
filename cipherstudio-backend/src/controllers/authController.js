const User = require("../models/User")
const jwt = require("jsonwebtoken")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "7d",
  })
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists. Please try logging in instead." })
    }

    // Create new user
    const user = new User({ email, password })
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: "Account created successfully! Welcome to CipherStudio.",
      token,
      user: { id: user._id, email: user.email },
    })
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: messages.join('. ') })
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: "An account with this email already exists. Please try logging in instead." })
    }

    res.status(500).json({ error: "Registration failed. Please try again." })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

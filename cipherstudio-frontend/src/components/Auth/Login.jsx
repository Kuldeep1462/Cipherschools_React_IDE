"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Auth.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })
  localStorage.setItem("token", response.data.token)
  localStorage.setItem("userId", response.data.user.id)
  try { window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isSignedIn: true, userId: response.data.user.id } })) } catch {}
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your CipherStudio account</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <button onClick={() => navigate("/register")} className="auth-link-button">Sign up</button>
        </p>
      </div>
    </div>
  )
}

export default Login

"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import "./Auth.css"

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!password) {
      setError("Password is required")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const data = await api.auth.register(email.trim().toLowerCase(), password)
      if (data?.error) {
        setError(data.error)
        setIsLoading(false)
        return
      }
      if (data?.token && data?.user?.id) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("userId", data.user.id)
        try { window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isSignedIn: true, userId: data.user.id } })) } catch {}
        navigate("/")
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : (err?.message || "Registration failed. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join CipherStudio and start coding</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleRegister}>
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
          <input
            type="password"
            className="auth-input"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <button onClick={() => navigate("/login")} className="auth-link-button">Sign in</button>
        </p>
      </div>
    </div>
  )
}

export default Register

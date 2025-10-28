"use client"

import { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { ProjectContext } from "../../context/ProjectContext"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const { autoSaveEnabled, setAutoSaveEnabled } = useContext(ProjectContext)
  const [saveStatus, setSaveStatus] = useState("saved")
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    setSaveStatus("saved")
    const timer = setTimeout(() => {
      setSaveStatus("idle")
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setIsSignedIn(!!localStorage.getItem("token"))
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("token")
    // Keep userId if you want to continue accessing guest-owned projects; otherwise clear it.
    // localStorage.removeItem("userId")
    setIsSignedIn(false)
    // Notify app about auth change
    try { window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isSignedIn: false } })) } catch {}
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span>⚡</span>
          <span>CipherStudio</span>
        </Link>
        <span className="navbar-title">React IDE</span>
      </div>
      <div className="navbar-right">
        <div className={`navbar-status ${saveStatus}`}>
          <span className="navbar-status-dot"></span>
          <span>{autoSaveEnabled ? "Autosave enabled" : "Autosave disabled"}</span>
        </div>
        <button className="navbar-button navbar-button-secondary" onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}>
          {autoSaveEnabled ? "Autosave On" : "Autosave Off"}
        </button>
        <button className="navbar-button navbar-button-secondary" onClick={toggleTheme}>
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        {isSignedIn ? (
          <button className="navbar-button navbar-button-secondary" onClick={handleSignOut}>Sign Out</button>
        ) : (
          <button className="navbar-button" onClick={() => navigate("/login")}>Sign In</button>
        )}
      </div>
    </nav>
  )
}

export default Navbar

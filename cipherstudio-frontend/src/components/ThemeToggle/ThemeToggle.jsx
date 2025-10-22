"use client"

import { useContext, useState } from "react"
import { ThemeContext } from "../../context/ThemeContext"
import "./ThemeToggle.css"

function ThemeToggle() {
  const { currentTheme, toggleTheme, availableThemes, themeNames, setTheme } = useContext(ThemeContext)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="theme-toggle-container">
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
        <span className="theme-toggle-icon">
          {currentTheme === "dark" ? "🌙" : currentTheme === "light" ? "☀️" : "🌊"}
        </span>
        <span className="theme-toggle-label">{themeNames[currentTheme]}</span>
      </button>

      <div className={`theme-menu ${showMenu ? "open" : ""}`}>
        <button className="theme-menu-toggle" onClick={() => setShowMenu(!showMenu)} title="More themes">
          ⋮
        </button>
        {showMenu && (
          <div className="theme-menu-dropdown">
            {availableThemes.map((theme) => (
              <button
                key={theme}
                className={`theme-menu-item ${currentTheme === theme ? "active" : ""}`}
                onClick={() => {
                  setTheme(theme)
                  setShowMenu(false)
                }}
              >
                <span className="theme-menu-icon">{theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🌊"}</span>
                <span>{themeNames[theme]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemeToggle

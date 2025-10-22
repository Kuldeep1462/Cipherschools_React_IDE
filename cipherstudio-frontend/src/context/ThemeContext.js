"use client"

import { createContext, useState, useEffect } from "react"

export const ThemeContext = createContext()

const THEMES = {
  dark: {
    name: "Dark",
    colors: {
      "color-bg-primary": "#0f0f0f",
      "color-bg-secondary": "#1a1a1a",
      "color-bg-tertiary": "#252525",
      "color-text-primary": "#ffffff",
      "color-text-secondary": "#b0b0b0",
      "color-accent-primary": "#00d9ff",
      "color-accent-secondary": "#7c3aed",
      "color-border": "#333333",
      "color-success": "#10b981",
      "color-error": "#ef4444",
      "color-warning": "#f59e0b",
    },
  },
  light: {
    name: "Light",
    colors: {
      "color-bg-primary": "#ffffff",
      "color-bg-secondary": "#f5f5f5",
      "color-bg-tertiary": "#eeeeee",
      "color-text-primary": "#1a1a1a",
      "color-text-secondary": "#666666",
      "color-accent-primary": "#0099cc",
      "color-accent-secondary": "#6d28d9",
      "color-border": "#e0e0e0",
      "color-success": "#059669",
      "color-error": "#dc2626",
      "color-warning": "#d97706",
    },
  },
  ocean: {
    name: "Ocean",
    colors: {
      "color-bg-primary": "#0a1628",
      "color-bg-secondary": "#0f1f3c",
      "color-bg-tertiary": "#1a2f52",
      "color-text-primary": "#e8f0f8",
      "color-text-secondary": "#a0b8d4",
      "color-accent-primary": "#00d4ff",
      "color-accent-secondary": "#0099ff",
      "color-border": "#2a4070",
      "color-success": "#00d97e",
      "color-error": "#ff6b6b",
      "color-warning": "#ffa500",
    },
  },
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
    setIsLoading(false)
  }, [])

  const applyTheme = (themeName) => {
    const theme = THEMES[themeName]
    if (!theme) return

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }

  const toggleTheme = () => {
    const themes = Object.keys(THEMES)
    const currentIndex = themes.indexOf(currentTheme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setCurrentTheme(nextTheme)
    localStorage.setItem("theme", nextTheme)
    applyTheme(nextTheme)
  }

  const setTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName)
      localStorage.setItem("theme", themeName)
      applyTheme(themeName)
    }
  }

  const value = {
    currentTheme,
    isDarkMode: currentTheme === "dark",
    toggleTheme,
    setTheme,
    availableThemes: Object.keys(THEMES),
    themeNames: Object.entries(THEMES).reduce((acc, [key, theme]) => {
      acc[key] = theme.name
      return acc
    }, {}),
    isLoading,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

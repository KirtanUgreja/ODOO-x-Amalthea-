"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme)
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      localStorage.setItem("theme", theme)
    } catch (error) {
      console.error('Error saving theme to localStorage:', error)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  // Always provide consistent theme value to prevent hydration mismatch
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

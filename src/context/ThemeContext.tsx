'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"

type ThemeContextType = {
  theme: "light" | "dark"
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  mounted: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("DulyHired-theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = stored || (prefersDark ? "dark" : "light")
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    if (animating) return
    setAnimating(true)

    const newTheme = theme === "light" ? "dark" : "light"
    const oldBg = theme === "light" ? "#ffffff" : "#0f1117"
    const newBg = newTheme === "light" ? "#ffffff" : "#0f1117"

    // Create the wave overlay element
    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: ${oldBg};
      pointer-events: none;
      clip-path: inset(0 0 0 0);
      transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `
    document.body.appendChild(overlay)

    // Force layout then trigger clip animation
    requestAnimationFrame(() => {
      overlay.style.clipPath = "inset(0 0 100% 0)"

      setTimeout(() => {
        // Flip the theme behind the overlay
        setTheme(newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
        localStorage.setItem("DulyHired-theme", newTheme)

        // Reveal by animating clip from bottom up
        overlay.style.clipPath = "inset(0 0 0 0)"
        overlay.style.background = newBg

        setTimeout(() => {
          overlay.remove()
          setAnimating(false)
        }, 500)
      }, 20)
    })
  }, [theme, animating])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

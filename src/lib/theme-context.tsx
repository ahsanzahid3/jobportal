"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false,
  toggle: () => {},
  setTheme: () => {},
});

const DARK_BG = "#0f1117";
const LIGHT_BG = "#ffffff";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayBg, setOverlayBg] = useState(LIGHT_BG);
  const [animationRunning, setAnimationRunning] = useState(false);
  const toggleInProgress = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("DulyHired_theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
    } else if (
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setThemeState("dark");
    }
    setMounted(true);
  }, []);

  // Apply theme class instantly — no transitions
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("DulyHired_theme", theme);
  }, [theme, mounted]);

  const toggle = useCallback(() => {
    if (toggleInProgress.current) return;
    toggleInProgress.current = true;

    const currentTheme = theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    const oldBg = currentTheme === "dark" ? DARK_BG : LIGHT_BG;

    // 1. Show overlay with OLD theme bg, animation is paused at `from` keyframe
    //    which is `inset(0 0 0 0)` — fully covering the page
    setOverlayBg(oldBg);
    setOverlayVisible(true);
    setAnimationRunning(false);

    // 2. Double-rAF ensures the overlay paints before we flip the theme
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 3. Flip theme instantly — invisible behind the overlay
        setThemeState(newTheme);

        // 4. On next frame, start the wipe — overlay animates from
        //    inset(0 0 0 0) → inset(100% 0 0 0), revealing the new theme from top to bottom
        requestAnimationFrame(() => {
          setAnimationRunning(true);
        });
      });
    });
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    if (t === theme) return;
    // Do a smooth toggle via the wave effect if switching
    // For programmatic setTheme, just do it directly
    setThemeState(t);
  }, [theme]);

  const handleAnimationEnd = useCallback(() => {
    setOverlayVisible(false);
    setAnimationRunning(false);
    toggleInProgress.current = false;
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", toggle, setTheme }}
    >
      {children}

      {/* Top-to-bottom wave overlay */}
      {overlayVisible && (
        <div
          className={`theme-wipe-overlay${animationRunning ? " theme-wipe-overlay--running" : ""}`}
          style={{ backgroundColor: overlayBg }}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

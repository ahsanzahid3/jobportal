"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Locale = "en" | "de" | "es" | "it" | "nl";

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  localeName: (l: Locale) => string;
  availableLocales: Locale[];
}

const I18nContext = createContext<I18nContextType | null>(null);

function loadMessages(locale: Locale): Record<string, string> {
  try {
    // Dynamic require for the locale file
    const messages = require(`./${locale}.json`) as Record<string, string>;
    return messages;
  } catch {
    // Fallback to English
    try {
      return require("./en.json") as Record<string, string>;
    } catch {
      return {};
    }
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<Record<string, string>>(loadMessages("en"));

  // Load saved locale on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("DulyHired-locale") as Locale | null;
      if (saved && ["en", "de", "es", "it", "nl"].includes(saved)) {
        setLocaleState(saved);
        setMessages(loadMessages(saved));
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setMessages(loadMessages(l));
    try {
      localStorage.setItem("DulyHired-locale", l);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    let text = messages[key] || key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, v);
      }
    }
    return text;
  }, [messages]);

  const localeName = useCallback((l: Locale) => LOCALE_NAMES[l], []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, localeName, availableLocales: ["en", "de", "es", "it", "nl"] }}>
      <div lang={locale}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LOCALE_NAMES };
export type { I18nContextType };

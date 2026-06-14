"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "@/i18n/context";
import { Globe, ChevronDown, Check } from "lucide-react";

const FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  es: "🇪🇸",
  it: "🇮🇹",
  nl: "🇳🇱",
};

export default function LanguageSwitcher() {
  const { locale, setLocale, localeName, availableLocales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
        aria-label="Switch language"
      >
        <Globe size={16} />
        <span className="hidden sm:inline text-xs">{FLAGS[locale]} {localeName(locale)}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 py-1 min-w-[160px] animate-fade-in">
          {availableLocales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                locale === l
                  ? "bg-primary-light dark:bg-primary/20 text-primary font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
              }`}
            >
              <span>{FLAGS[l]}</span>
              <span>{localeName(l)}</span>
              {locale === l && <Check size={14} className="ml-auto text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

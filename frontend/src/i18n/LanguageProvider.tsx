import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { translations, type Lang } from './translations'

const STORAGE_KEY = 'fs-lang'
const DEFAULT_LANG: Lang = 'uz' // Uzbek is the default per product requirement.

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  /** Translate a dotted key, e.g. t('shop.title'). Falls back to English, then the key. */
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<LangContextValue | null>(null)

function lookup(lang: Lang, key: string): string | undefined {
  const path = key.split('.')
  let node: any = translations[lang]
  for (const p of path) {
    if (node == null) return undefined
    node = node[p]
  }
  return typeof node === 'string' ? node : undefined
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'uz' || stored === 'en' ? stored : DEFAULT_LANG
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggle = useCallback(() => setLangState(l => (l === 'uz' ? 'en' : 'uz')), [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const val = lookup(lang, key) ?? lookup('en', key) ?? key
      return interpolate(val, vars)
    },
    [lang]
  )

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}

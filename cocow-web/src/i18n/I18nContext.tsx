import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { enUS } from './locales/en-us'
import type { Translations } from './locales/en-us'
import { zhCN } from './locales/zh-cn'
import { zhTW } from './locales/zh-tw'
import { zhHK } from './locales/zh-hk'
import { enGB } from './locales/en-gb'
import { jaJP } from './locales/ja-jp'
import { koKR } from './locales/ko-kr'
import { esES } from './locales/es-es'
import { frFR } from './locales/fr-fr'
import { deDE } from './locales/de-de'
import { ptBR } from './locales/pt-br'
import { ruRU } from './locales/ru-ru'
import { itIT } from './locales/it-it'
import { arSA } from './locales/ar-sa'

type Language = 'en-us' | 'en-gb' | 'zh-cn' | 'zh-tw' | 'zh-hk' | 'ja-jp' | 'ko-kr' | 'es-es' | 'fr-fr' | 'de-de' | 'pt-br' | 'ru-ru' | 'it-it' | 'ar-sa'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  availableLanguages: { code: Language; name: string }[]
}

const translations: Record<Language, Translations> = {
  'en-us': enUS,
  'en-gb': enGB,
  'zh-cn': zhCN,
  'zh-tw': zhTW,
  'zh-hk': zhHK,
  'ja-jp': jaJP,
  'ko-kr': koKR,
  'es-es': esES,
  'fr-fr': frFR,
  'de-de': deDE,
  'pt-br': ptBR,
  'ru-ru': ruRU,
  'it-it': itIT,
  'ar-sa': arSA,
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Language code migration map
const languageMigrationMap: Record<string, Language> = {
  'en': 'en-us',
  'zh': 'zh-cn',
  'zh-mo': 'zh-hk',
  'ja': 'ja-jp',
  'ko': 'ko-kr',
  'es': 'es-es',
  'fr': 'fr-fr',
  'de': 'de-de',
  'pt': 'pt-br',
  'ru': 'ru-ru',
  'it': 'it-it',
  'ar': 'ar-sa',
}

// Detect browser language and map to supported language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US'
  const normalized = browserLang.toLowerCase()
  
  // Direct match
  if (normalized in translations) {
    return normalized as Language
  }
  
  // Try language code only (e.g., 'en' from 'en-US')
  const langCode = normalized.split('-')[0]
  if (langCode in languageMigrationMap) {
    return languageMigrationMap[langCode]
  }
  
  // Try to find a match with same language code
  const matchingLang = Object.keys(translations).find(lang => 
    lang.startsWith(langCode + '-')
  )
  if (matchingLang) {
    return matchingLang as Language
  }
  
  return 'en-us'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    if (saved) {
      // Migrate old language codes to new format
      const migrated = languageMigrationMap[saved] || saved
      // Validate the language code exists in translations
      if (migrated in translations) {
        // Update localStorage if migration happened
        if (migrated !== saved) {
          localStorage.setItem('language', migrated)
        }
        return migrated as Language
      }
    }
    // No saved preference, detect from browser
    const detected = detectBrowserLanguage()
    localStorage.setItem('language', detected)
    return detected
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // Update document title when language changes
  useEffect(() => {
    document.title = translations[language].site.title
  }, [language])

  const availableLanguages = [
    { code: 'en-us' as Language, name: 'English (US)' },
    { code: 'en-gb' as Language, name: 'English (UK)' },
    { code: 'zh-cn' as Language, name: '简体中文' },
    { code: 'zh-tw' as Language, name: '繁體中文 (台灣)' },
    { code: 'zh-hk' as Language, name: '繁體中文 (香港)' },
    { code: 'ja-jp' as Language, name: '日本語' },
    { code: 'ko-kr' as Language, name: '한국어' },
    { code: 'es-es' as Language, name: 'Español' },
    { code: 'fr-fr' as Language, name: 'Français' },
    { code: 'de-de' as Language, name: 'Deutsch' },
    { code: 'pt-br' as Language, name: 'Português (BR)' },
    { code: 'ru-ru' as Language, name: 'Русский' },
    { code: 'it-it' as Language, name: 'Italiano' },
    { code: 'ar-sa' as Language, name: 'العربية' },
  ]

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
        availableLanguages,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

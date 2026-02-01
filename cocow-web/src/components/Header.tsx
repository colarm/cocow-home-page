import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import { themes } from '../theme/themes'
import './Header.css'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const { language, setLanguage, t, availableLanguages } = useI18n()
  const { theme, setTheme } = useTheme()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Detect if mobile
  const isMobile = () => window.innerWidth <= 768

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false)
      }
    }

    if (showLangMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLangMenu, showThemeMenu])

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if ((showLangMenu || showThemeMenu) && isMobile()) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showLangMenu, showThemeMenu])

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className="header-brand">
            <div className="logo">🥥</div>
            <div className="header-titles">
              <h1 className="header-title">{t.site.title}</h1>
              <p className="header-subtitle">{t.nav.subtitle}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="header-search">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder={t.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Language Selector and Theme Selector */}
          <div className="header-actions">
            {/* Theme Selector */}
            <div className="selector-wrapper" ref={themeMenuRef}>
              <button
                className="selector-button theme-button"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu)
                  setShowLangMenu(false)
                }}
                aria-label="Switch theme"
                aria-expanded={showThemeMenu}
              >
                <svg
                  className="selector-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                <span className="selector-text">{t.theme[theme]}</span>
              </button>

              {showThemeMenu && (
                <>
                  <div 
                    className="menu-overlay" 
                    onClick={() => setShowThemeMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="selector-menu theme-menu">
                    <div className="menu-header">
                      <span className="menu-title">Theme</span>
                      <button
                        className="menu-close"
                        onClick={() => setShowThemeMenu(false)}
                        aria-label="Close"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="menu-list">
                      {themes.map((themeOption) => (
                        <button
                          key={themeOption.id}
                          className={`menu-item ${theme === themeOption.id ? 'active' : ''}`}
                          onClick={() => {
                            setTheme(themeOption.id)
                            setShowThemeMenu(false)
                          }}
                        >
                          <span className="theme-indicator" style={{
                            backgroundColor: themeOption.colors.accent
                          }} />
                          <span className="menu-item-text">{t.theme[themeOption.id]}</span>
                          {theme === themeOption.id && (
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language Selector */}
            <div className="selector-wrapper" ref={langMenuRef}>
              <button
                className="selector-button language-button"
                onClick={() => {
                  setShowLangMenu(!showLangMenu)
                  setShowThemeMenu(false)
                }}
                aria-label={t.language.switch}
                aria-expanded={showLangMenu}
              >
                <svg
                  className="selector-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span className="selector-text">{t.language.name}</span>
              </button>

              {showLangMenu && (
                <>
                  <div 
                    className="menu-overlay" 
                    onClick={() => setShowLangMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="selector-menu language-menu">
                    <div className="menu-header">
                      <span className="menu-title">Language</span>
                      <button
                        className="menu-close"
                        onClick={() => setShowLangMenu(false)}
                        aria-label="Close"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="menu-list">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`menu-item ${language === lang.code ? 'active' : ''}`}
                          onClick={() => {
                            setLanguage(lang.code)
                            setShowLangMenu(false)
                          }}
                        >
                          <span className="menu-item-text">{lang.name}</span>
                          {language === lang.code && (
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

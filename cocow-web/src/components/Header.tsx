import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import { useAuth, type AuthUser } from '../context/AuthContext'
import { themes } from '../theme/themes'
import './Header.css'

function getInitials(user: AuthUser): string {
  const name = (user.username ?? user.email ?? '').trim()
  if (!name) return '?'
  const words = name.split(/\s+/)
  if (words.length >= 2) {
    return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

interface HeaderProps {
  onLoginClick?: () => void
}

export default function Header({ onLoginClick }: HeaderProps) {
  const { language, setLanguage, t, availableLanguages } = useI18n()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showLangMenu || showThemeMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLangMenu, showThemeMenu, showUserMenu])

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if ((showLangMenu || showThemeMenu || showUserMenu) && isMobile()) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showLangMenu, showThemeMenu, showUserMenu])

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

          {/* Language Selector and Theme Selector */}
          <div className="header-actions">
{/* Auth Section */}
            {user ? (
              <div className="selector-wrapper" ref={userMenuRef}>
                <button
                  className="action-btn action-btn--ghost"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu)
                    setShowLangMenu(false)
                    setShowThemeMenu(false)
                  }}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <span className="user-avatar action-icon" aria-hidden="true">
                    {getInitials(user)}
                  </span>
                  <span className="action-text">
                    {user.username ?? user.email ?? 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="menu-overlay"
                      onClick={() => setShowUserMenu(false)}
                      aria-hidden="true"
                    />
                    <div className="selector-menu user-menu">
                      <div className="menu-header">
                        <span className="menu-title">{t.user.account}</span>
                        <button
                          className="menu-close"
                          onClick={() => setShowUserMenu(false)}
                          aria-label="Close"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="user-menu-info">
                        <div className="user-menu-avatar">{getInitials(user)}</div>
                        <div className="user-menu-details">
                          {user.username && <span className="user-menu-name">{user.username}</span>}
                          {user.email && <span className="user-menu-email">{user.email}</span>}
                        </div>
                      </div>
                      <div className="menu-divider" />
                      <div className="menu-list">
                        <a
                          className="menu-item"
                          href={import.meta.env.VITE_SSO_URL}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="menu-item-text">{t.user.profileSettings}</span>
                        </a>
                        <button
                          className="menu-item menu-item-danger"
                          onClick={() => { logout(); setShowUserMenu(false) }}
                        >
                          <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="menu-item-text">{t.user.signOut}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : onLoginClick ? (
              <button className="action-btn" onClick={onLoginClick} aria-label="Sign in">
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="action-text">{t.user.signIn}</span>
              </button>
            ) : null}
            {/* Theme Selector */}
            <div className="selector-wrapper" ref={themeMenuRef}>
              <button
                className="action-btn"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu)
                  setShowLangMenu(false)
                }}
                aria-label="Switch theme"
                aria-expanded={showThemeMenu}
              >
                <svg
                  className="action-icon"
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
                <span className="action-text">{t.theme[theme]}</span>
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
                className="action-btn"
                onClick={() => {
                  setShowLangMenu(!showLangMenu)
                  setShowThemeMenu(false)
                }}
                aria-label={t.language.switch}
                aria-expanded={showLangMenu}
              >
                <svg
                  className="action-icon"
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
                <span className="action-text">{t.language.name}</span>
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

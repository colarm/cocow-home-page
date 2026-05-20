import { useState, useEffect, useRef, useCallback } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  fetchUserWebsites,
  fetchWebsites,
  addUserWebsite,
  removeUserWebsite,
  patchUserWebsite,
  reorderUserWebsites,
} from '../api'
import type { UserWebsite, Website } from '../types'
import './UserWebsitesManager.css'

interface UserWebsitesManagerProps {
  onClose: () => void
}

export default function UserWebsitesManager({ onClose }: UserWebsitesManagerProps) {
  const { t } = useI18n()
  const [userWebsites, setUserWebsites] = useState<UserWebsite[]>([])
  const [catalog, setCatalog] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddSearch, setShowAddSearch] = useState(false)
  const [addResults, setAddResults] = useState<Website[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fetch data
  useEffect(() => {
    Promise.all([fetchUserWebsites(), fetchWebsites()])
      .then(([uw, cat]) => {
        setUserWebsites(uw)
        setCatalog(cat)
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Filter catalog for add search
  useEffect(() => {
    if (!showAddSearch || !searchQuery.trim()) {
      setAddResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const userWebsiteIds = new Set(userWebsites.map(uw => uw.websiteId))
    const filtered = catalog.filter(
      w =>
        !userWebsiteIds.has(w.id) &&
        w.name.toLowerCase().includes(q)
    )
    setAddResults(filtered)
  }, [searchQuery, showAddSearch, catalog, userWebsites])

  const handleAdd = useCallback(async (website: Website) => {
    try {
      const newEntry = await addUserWebsite(website.id, userWebsites.length)
      setUserWebsites(prev => [...prev, newEntry])
      setSearchQuery('')
      setAddResults([])
      setShowAddSearch(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    }
  }, [userWebsites.length])

  const handleRemove = useCallback(async (websiteId: string) => {
    try {
      await removeUserWebsite(websiteId)
      setUserWebsites(prev => prev.filter(uw => uw.websiteId !== websiteId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove')
    }
  }, [])

  const handleTogglePin = useCallback(async (entry: UserWebsite) => {
    try {
      const updated = await patchUserWebsite(entry.websiteId, { isPinned: !entry.isPinned })
      setUserWebsites(prev =>
        prev.map(uw => uw.websiteId === entry.websiteId ? { ...uw, isPinned: !entry.isPinned } : uw)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }, [])

  const handleMove = useCallback(async (websiteId: string, direction: 'up' | 'down') => {
    const idx = userWebsites.findIndex(uw => uw.websiteId === websiteId)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= userWebsites.length) return

    const currentOrder = userWebsites[idx]!.displayOrder
    const swapOrder = userWebsites[swapIdx]!.displayOrder

    try {
      await Promise.all([
        patchUserWebsite(websiteId, { displayOrder: swapOrder }),
        patchUserWebsite(userWebsites[swapIdx]!.websiteId, { displayOrder: currentOrder }),
      ])
      setUserWebsites(prev => {
        const next = [...prev]
        const temp = next[idx]!
        next[idx] = { ...next[swapIdx]!, displayOrder: swapOrder }
        next[swapIdx] = { ...temp, displayOrder: currentOrder }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder')
    }
  }, [userWebsites])

  const handleSaveOrder = useCallback(async () => {
    const items = userWebsites.map((uw, i) => ({
      websiteId: uw.websiteId,
      displayOrder: i,
    }))
    try {
      await reorderUserWebsites(items)
      setUserWebsites(prev =>
        prev.map((uw, i) => ({ ...uw, displayOrder: i }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save order')
    }
  }, [userWebsites])

  if (loading) {
    return (
      <div className="uw-overlay" onClick={onClose}>
        <div className="uw-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
          <div className="uw-loading">
            <div className="uw-spinner" />
            <p>{t.nav.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="uw-overlay" onClick={onClose}>
      <div className="uw-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="uw-header">
          <h2 className="uw-title">{t.userWebsites.title}</h2>
          <div className="uw-header-actions">
            <button
              className="uw-btn uw-btn--primary"
              onClick={() => { setShowAddSearch(true); setSearchQuery('') }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t.userWebsites.add}</span>
            </button>
            <button className="uw-close-btn" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="uw-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>&times;</button>
          </div>
        )}

        {/* Add search */}
        {showAddSearch && (
          <div className="uw-add-section">
            <div className="uw-search-input-wrap">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" className="uw-search-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="uw-search-input"
                placeholder={t.userWebsites.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="uw-clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
              )}
              <button className="uw-cancel-add" onClick={() => { setShowAddSearch(false); setSearchQuery('') }}>
                {t.common?.cancel ?? 'Cancel'}
              </button>
            </div>
            {addResults.length > 0 && (
              <div className="uw-add-results">
                {addResults.map(site => (
                  <button key={site.id} className="uw-add-item" onClick={() => handleAdd(site)}>
                    <div className="uw-add-item-icon">
                      {site.icon ? (
                        <img src={site.icon} alt={site.name} />
                      ) : (
                        <span>{site.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="uw-add-item-name">{site.name}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && addResults.length === 0 && (
              <p className="uw-empty-text">{t.userWebsites.noResults}</p>
            )}
          </div>
        )}

        {/* List */}
        {userWebsites.length === 0 ? (
          <div className="uw-empty">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{t.userWebsites.empty}</p>
            <button className="uw-btn uw-btn--primary" onClick={() => { setShowAddSearch(true); setSearchQuery('') }}>
              {t.userWebsites.add}
            </button>
          </div>
        ) : (
          <div className="uw-list">
            {userWebsites.map((entry, index) => (
              <div
                key={entry.websiteId}
                className={`uw-list-item ${entry.isPinned ? 'uw-list-item--pinned' : ''}`}
              >
                {/* Icon */}
                <div className="uw-list-item-icon">
                  {entry.website.icon ? (
                    <img src={entry.website.icon} alt={entry.website.name} />
                  ) : (
                    <span>{entry.website.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="uw-list-item-info">
                  <span className="uw-list-item-name">{entry.website.name}</span>
                  <span className="uw-list-item-url">{new URL(entry.website.url).hostname}</span>
                </div>

                {/* Controls */}
                <div className="uw-list-item-controls">
                  <button
                    className={`uw-icon-btn ${entry.isPinned ? 'uw-icon-btn--active' : ''}`}
                    title={entry.isPinned ? t.userWebsites.unpin : t.userWebsites.pin}
                    onClick={() => handleTogglePin(entry)}
                  >
                    <svg viewBox="0 0 24 24" fill={entry.isPinned ? 'currentColor' : 'none'} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    className="uw-icon-btn"
                    title={t.userWebsites.moveUp}
                    onClick={() => handleMove(entry.websiteId, 'up')}
                    disabled={index === 0}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    className="uw-icon-btn"
                    title={t.userWebsites.moveDown}
                    onClick={() => handleMove(entry.websiteId, 'down')}
                    disabled={index === userWebsites.length - 1}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    className="uw-icon-btn uw-icon-btn--danger"
                    title={t.userWebsites.remove}
                    onClick={() => handleRemove(entry.websiteId)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

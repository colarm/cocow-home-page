import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { cocowSearch } from '../api'
import './SearchEngine.css'

interface SearchEngine {
  id: string
  name: string
  icon: string
  url: string
}

const searchEngines: SearchEngine[] = [
  // Cocow search is not implemented yet, so we will use Google as default for now
  // { id: 'cocow', name: 'Cocow', icon: '🥥', url: '' },
  { id: 'google', name: 'Google', icon: '🔍', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', icon: '🔷', url: 'https://www.bing.com/search?q=' },
  { id: 'baidu', name: '百度', icon: '🐾', url: 'https://www.baidu.com/s?wd=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q=' },
]

export default function SearchEngine() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(() => {
    const saved = localStorage.getItem('selectedSearchEngine')
    return searchEngines.find(e => e.id === saved) ?? searchEngines[0]
  })

  const getEngineName = (engine: SearchEngine) =>
    engine.id === 'cocow' ? t.site.title : engine.name
  const [showEngines, setShowEngines] = useState(false)
  const engineMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (engineMenuRef.current && !engineMenuRef.current.contains(event.target as Node)) {
        setShowEngines(false)
      }
    }
    if (showEngines) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEngines])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (selectedEngine.id === 'cocow') {
      cocowSearch(query)
      return
    }
    window.open(selectedEngine.url + encodeURIComponent(query), '_blank')
  }

  return (
    <div className="search-engine">
      <form className="search-engine-form" onSubmit={handleSearch}>
        <div className="search-engine-selector selector-wrapper" ref={engineMenuRef}>
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowEngines(!showEngines)}
          >
            <span className="engine-icon">{selectedEngine.icon}</span>
            <span className="action-text">{getEngineName(selectedEngine)}</span>
            <svg
              className={`chevron-icon ${showEngines ? 'rotate' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showEngines && (
            <div className="selector-menu engine-menu">
              <div className="menu-list">
                {searchEngines.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    className={`menu-item ${selectedEngine.id === engine.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedEngine(engine)
                      localStorage.setItem('selectedSearchEngine', engine.id)
                      setShowEngines(false)
                    }}
                  >
                    <span className="engine-icon">{engine.icon}</span>
                    <span className="menu-item-text">{getEngineName(engine)}</span>
                    {selectedEngine.id === engine.id && (
                      <svg
                        className="check-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="search-engine-input-wrapper">
          <input
            type="text"
            className="search-engine-input"
            placeholder={`${t.searchEngine.prefix}${getEngineName(selectedEngine)}${t.searchEngine.suffix}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-engine-submit">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

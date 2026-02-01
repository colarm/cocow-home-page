import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import './SearchEngine.css'

interface SearchEngine {
  id: string
  name: string
  icon: string
  url: string
}

const searchEngines: SearchEngine[] = [
  { id: 'google', name: 'Google', icon: '🔍', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', icon: '🅱️', url: 'https://www.bing.com/search?q=' },
  { id: 'baidu', name: '百度', icon: '🅱️', url: 'https://www.baidu.com/s?wd=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q=' },
]

export default function SearchEngine() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(searchEngines[0])
  const [showEngines, setShowEngines] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.open(selectedEngine.url + encodeURIComponent(query), '_blank')
    }
  }

  return (
    <div className="search-engine">
      <form className="search-engine-form" onSubmit={handleSearch}>
        <div className="search-engine-selector">
          <button
            type="button"
            className="engine-button"
            onClick={() => setShowEngines(!showEngines)}
          >
            <span className="engine-icon">{selectedEngine.icon}</span>
            <span className="engine-name">{selectedEngine.name}</span>
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
            <div className="engine-menu">
              {searchEngines.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  className={`engine-item ${selectedEngine.id === engine.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedEngine(engine)
                    setShowEngines(false)
                  }}
                >
                  <span className="engine-icon">{engine.icon}</span>
                  <span className="engine-name">{engine.name}</span>
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
          )}
        </div>

        <div className="search-engine-input-wrapper">
          <input
            type="text"
            className="search-engine-input"
            placeholder={`${t.searchEngine.prefix}${selectedEngine.name}${t.searchEngine.suffix}`}
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

import { useState, useMemo, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { fetchCategories, fetchWebsites } from '../api'
import type { Website, Category } from '../types'
import Header from './Header'
import SearchEngine from './SearchEngine'
import './home.css'

export default function Home() {
  const { t } = useI18n()
  const [websites, setWebsites] = useState<Website[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: t.categories.all, icon: '🌐', order: 0 }
  ])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then(data => {
        setCategories([
          { id: 'all', name: t.categories.all, icon: '🌐', order: 0 },
          ...data
        ])
      })
      .catch(err => setError(err.message))
  }, [])

  // Fetch websites
  useEffect(() => {
    setLoading(true)
    fetchWebsites(selectedCategory)
      .then(data => {
        setWebsites(data)
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedCategory])

  const filteredWebsites = useMemo(() => {
    if (!searchQuery.trim()) {
      return websites
    }

    const query = searchQuery.toLowerCase()
    return websites.filter(
      (site) =>
        site.name.toLowerCase().includes(query) ||
        site.url.toLowerCase().includes(query) ||
        site.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [websites, searchQuery])

  return (
    <div className="home">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="main">
        <div className="container">
          {/* Search Engine */}
          <SearchEngine />

          {/* Category Filter */}
          <nav className="categories" aria-label="Category filter">
            <div className="categories-scroll">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={selectedCategory === category.id}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Website Grid */}
          <div className="content">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner" />
                <p className="loading-text">Loading...</p>
              </div>
            ) : error ? (
              <div className="error">
                <svg
                  className="error-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="error-text">{error}</p>
              </div>
            ) : filteredWebsites.length === 0 ? (
              <div className="empty">
                <svg
                  className="empty-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="empty-text">
                  {searchQuery ? t.nav.noResults : t.nav.noWebsites}
                </p>
              </div>
            ) : (
              <div className="website-grid">
                {filteredWebsites.map((website) => (
                  <a
                    key={website.id}
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-card"
                  >
                    {website.isFeatured && (
                      <div className="featured-badge">
                        <svg
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="website-icon-wrapper">
                      {website.icon ? (
                        <img
                          src={website.icon}
                          alt={website.name}
                          className="website-icon"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className="website-icon-fallback" style={{ display: website.icon ? 'none' : 'flex' }}>
                        {website.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="website-content">
                      <h3 className="website-name">{website.name}</h3>
                      <div className="website-url">{new URL(website.url).hostname}</div>
                    </div>

                    {website.tags && website.tags.length > 0 && (
                      <div className="website-tags">
                        {website.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            © {new Date().getFullYear()} {t.site.title}
          </p>
        </div>
      </footer>
    </div>
  )
}

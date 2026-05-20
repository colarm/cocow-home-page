import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { fetchLocalUsers, updateUserRole } from '../api'
import type { LocalUser } from '../types'
import './AdminPanel.css'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [users, setUsers] = useState<LocalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingSub, setUpdatingSub] = useState<string | null>(null)

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const result = await fetchLocalUsers(p, 20)
      setUsers(result.users)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setPage(result.page)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(0)
  }, [loadUsers])

  const handleRoleChange = async (sub: string, newRole: 'VIEWER' | 'ADMIN') => {
    setUpdatingSub(sub)
    try {
      await updateUserRole(sub, newRole)
      setUsers(prev => prev.map(u => u.sub === sub ? { ...u, role: newRole } : u))
      setSuccessMsg(t.admin.roleUpdated)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setUpdatingSub(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="admin">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <button className="admin-back-btn" onClick={onBack}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.admin.back}</span>
            </button>
            <h1 className="admin-title">{t.admin.title}</h1>
            <div className="admin-user-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{user?.email ?? user?.username ?? 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="admin-stat-value">{total}</span>
              <span className="admin-stat-label">{t.admin.totalUsers}</span>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="admin-message admin-message--error">
              <span>{error}</span>
              <button onClick={() => setError(null)}>&times;</button>
            </div>
          )}
          {successMsg && (
            <div className="admin-message admin-message--success">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)}>&times;</button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <p>{t.nav.loading}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p>{t.admin.noUsers}</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th">{t.admin.sub}</th>
                    <th className="admin-th">{t.admin.role}</th>
                    <th className="admin-th">{t.admin.createdAt}</th>
                    <th className="admin-th">{t.admin.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.sub} className={`admin-tr ${u.role === 'ADMIN' ? 'admin-tr--admin' : ''}`}>
                      <td className="admin-td">
                        <code className="admin-sub-code" title={u.sub}>
                          {u.sub.slice(0, 12)}...
                        </code>
                      </td>
                      <td className="admin-td">
                        <span className={`admin-role-badge ${u.role === 'ADMIN' ? 'admin-role-badge--admin' : 'admin-role-badge--viewer'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-td">{formatDate(u.createdAt)}</td>
                      <td className="admin-td">
                        {u.sub !== user?.sub && (
                          <div className="admin-role-actions">
                            <button
                              className={`admin-role-btn ${u.role === 'ADMIN' ? 'admin-role-btn--active' : ''}`}
                              onClick={() => handleRoleChange(u.sub, u.role === 'ADMIN' ? 'VIEWER' : 'ADMIN')}
                              disabled={updatingSub === u.sub}
                            >
                              {updatingSub === u.sub
                                ? t.admin.updating
                                : u.role === 'ADMIN'
                                  ? t.admin.demote
                                  : t.admin.promote}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                disabled={page === 0}
                onClick={() => loadUsers(page - 1)}
              >
                &larr; {t.admin.prev}
              </button>
              <span className="admin-page-info">
                {t.admin.pageInfo.replace('{page}', String(page + 1)).replace('{total}', String(totalPages))}
              </span>
              <button
                className="admin-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => loadUsers(page + 1)}
              >
                {t.admin.next} &rarr;
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { submitLoginCallback } from '../api'

/**
 * Handles the OAuth 2 redirect-back from the SSO frontend.
 *
 * Flow:
 *  1. cocow-web asks cocow-api for the SSO URL  (GET /api/v1/login/sso)
 *  2. Browser goes to SSO consent page
 *  3. SSO frontend redirects here:  /login/callback?code=…&state=…
 *  4. This component verifies CSRF state, then POSTs { code } to cocow-api
 *  5. cocow-api exchanges code → token → userinfo (server-side), sets the
 *     access token as an HttpOnly cookie, and returns { user }
 *  6. We persist the user info via AuthContext and redirect to "/"
 */
export default function LoginCallback() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)

      // ── CSRF state check ──────────────────────────────────────────────
      const returnedState = params.get('state')
      const expectedState = sessionStorage.getItem('oidc_state')
      sessionStorage.removeItem('oidc_state')

      if (!returnedState || returnedState !== expectedState) {
        setError('State mismatch — possible CSRF attack.')
        return
      }

      // ── Authorization code ────────────────────────────────────────────
      const code = params.get('code')
      const oauthError = params.get('error')

      if (oauthError) {
        setError(`SSO error: ${params.get('error_description') ?? oauthError}`)
        return
      }

      if (!code) {
        setError('No authorization code returned by SSO.')
        return
      }

      // ── Exchange code via cocow-api ───────────────────────────────────
      try {
        const { user } = await submitLoginCallback(code)
        login(user)
        window.location.replace('/')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Login failed.')
      }
    }

    handleCallback()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '100vh', gap: '16px', fontFamily: 'inherit',
      }}>
        <p style={{ color: 'var(--color-danger, red)', maxWidth: '400px', textAlign: 'center' }}>
          {error}
        </p>
        <a href="/" style={{ color: 'var(--color-accent)' }}>← Back to home</a>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', height: '100vh', gap: '16px', fontFamily: 'inherit',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
        Signing you in…
      </p>
    </div>
  )
}

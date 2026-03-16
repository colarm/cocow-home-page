import type { Website, Category } from "../types";
import type { AuthUser } from "../context/AuthContext";

// ── Home API ──────────────────────────────────────────────────────────────
const API_BASE = "/api/v1/home";

// ── Cocow Search API ──────────────────────────────────────────────────────
export async function cocowSearch(query: string): Promise<unknown[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/v1/search?${params}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.results ?? [];
}

// ── Login API ─────────────────────────────────────────────────────────────
const LOGIN_API = "/api/v1/login";

/**
 * Fetch all categories from the API
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch websites, optionally filtered by category
 */
export async function fetchWebsites(categoryId?: string): Promise<Website[]> {
  const params = new URLSearchParams();
  if (categoryId && categoryId !== "all") {
    params.append("category", categoryId);
  }

  const url = `${API_BASE}/websites${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch websites: ${response.statusText}`);
  }
  return response.json();
}

// ── SSO / OAuth2 API ─────────────────────────────────────────────────────

/**
 * Ask cocow-api for the SSO authorization URL, then redirect the browser to
 * the SSO consent page. Stores a CSRF state token in sessionStorage first.
 * All OAuth2 config (client_id, secret, scopes) lives on the backend.
 */
export async function redirectToSso(): Promise<void> {
  const state = crypto.randomUUID();
  sessionStorage.setItem("oidc_state", state);

  const res = await fetch(
    `${LOGIN_API}/sso?state=${encodeURIComponent(state)}`,
  );
  if (!res.ok) throw new Error(`Failed to get SSO URL (${res.status})`);

  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}

/**
 * Send the authorization code to cocow-api, which exchanges it for a token
 * and fetches userinfo from sso-server. Returns user; the token is stored
 * as an HttpOnly cookie by the server and never exposed to JS.
 */
export async function submitLoginCallback(
  code: string,
): Promise<{ user: AuthUser }> {
  const res = await fetch(`${LOGIN_API}/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(`Login callback failed (${res.status})`);
  return res.json() as Promise<{ user: AuthUser }>;
}

/**
 * Ask cocow-api to clear the auth_token HttpOnly cookie.
 */
export async function logoutFromApi(): Promise<void> {
  await fetch(`${LOGIN_API}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

import type { Website, Category, UserWebsite, LocalUser } from "../types";
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

// ── Home Search API ───────────────────────────────────────────────────────

/**
 * Search websites by name on the backend (case-insensitive).
 */
export async function searchWebsites(query: string): Promise<Website[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/v1/home/search?${params}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a single website by ID with its category.
 */
export async function fetchWebsiteById(id: string): Promise<Website> {
  const response = await fetch(`${API_BASE}/websites/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.statusText}`);
  }
  return response.json();
}

// ── User Websites API ─────────────────────────────────────────────────────
const USER_WEBSITES_API = "/api/v1/user-websites";

/**
 * Get authenticated user's personal website list.
 */
export async function fetchUserWebsites(): Promise<UserWebsite[]> {
  const response = await fetch(USER_WEBSITES_API, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user websites: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Add a website to user's personal list (idempotent upsert).
 */
export async function addUserWebsite(
  websiteId: string,
  displayOrder?: number,
): Promise<UserWebsite> {
  const body: { websiteId: string; displayOrder?: number } = { websiteId };
  if (displayOrder !== undefined) body.displayOrder = displayOrder;

  const response = await fetch(USER_WEBSITES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to add website: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Remove a website from user's personal list.
 */
export async function removeUserWebsite(websiteId: string): Promise<void> {
  const response = await fetch(`${USER_WEBSITES_API}/${websiteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to remove website: ${response.statusText}`);
  }
}

/**
 * Update displayOrder and/or isPinned for a user website entry.
 */
export async function patchUserWebsite(
  websiteId: string,
  data: { displayOrder?: number; isPinned?: boolean },
): Promise<UserWebsite> {
  const response = await fetch(`${USER_WEBSITES_API}/${websiteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update website: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Batch reorder user websites atomically.
 */
export async function reorderUserWebsites(
  items: { websiteId: string; displayOrder: number }[],
): Promise<UserWebsite[]> {
  const response = await fetch(`${USER_WEBSITES_API}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reorder websites: ${response.statusText}`);
  }
  return response.json();
}

// ── Local Users (Admin) API ───────────────────────────────────────────────
const LOCAL_USERS_API = "/api/v1/local-users";

/**
 * Get paginated list of local users (ADMIN only).
 */
export async function fetchLocalUsers(
  page = 0,
  size = 20,
): Promise<{ users: LocalUser[]; total: number; page: number; size: number; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await fetch(`${LOCAL_USERS_API}?${params}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Change a user's role (ADMIN only).
 */
export async function updateUserRole(
  sub: string,
  role: "VIEWER" | "ADMIN",
): Promise<{ sub: string; role: string }> {
  const response = await fetch(`${LOCAL_USERS_API}/${sub}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    if (response.status === 400 && error?.error === "self_role_change") {
      throw new Error("Cannot change your own role");
    }
    throw new Error(`Failed to update role: ${response.statusText}`);
  }
  return response.json();
}

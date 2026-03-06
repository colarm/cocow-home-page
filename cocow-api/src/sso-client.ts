/**
 * sso-client.ts — SSO 登录工具函数
 *
 * 提供 `createSsoSession(username, password)` 工厂函数，返回一个会话对象。
 * 会话对象持有登录后的 JSESSIONID Cookie，并提供带认证的 fetch 方法。
 *
 * 特性：
 *  - 首次调用时自动登录 SSO，获取并缓存 JSESSIONID
 *  - 后续请求自动附带 Cookie，无需手动处理
 *  - 遇到 401 时自动重新登录并重试一次
 *  - 多个并发请求只触发一次登录（防止登录风暴）
 *
 * 用法示例：
 *   import { createSsoSession } from "./sso-client.js";
 *
 *   const sso = createSsoSession("admin", "secret");
 *   const res = await sso.fetch("http://localhost:8848/api/v1/user/info");
 *   const user = await res.json();
 */

export type SsoSession = {
  /**
   * 使用此会话向 SSO 服务器发起已认证的 HTTP 请求。
   * 首次调用会自动登录；401 时自动重登并重试一次。
   */
  fetch(url: string, options?: RequestInit): Promise<Response>;

  /**
   * 主动登出并清除本地会话 Cookie。
   * 下次调用 `fetch` 会重新登录。
   */
  logout(): Promise<void>;

  /**
   * 仅清除本地缓存的 Cookie，不向服务器发送登出请求。
   * 用于会话已过期等场景。
   */
  invalidate(): void;
};

/**
 * 创建一个绑定指定用户名/密码的 SSO 会话对象。
 *
 * @param username  SSO 账号用户名
 * @param password  SSO 账号密码
 * @param ssoBaseUrl  SSO 服务器根 URL，默认读取 `SSO_URL` 环境变量
 */
export function createSsoSession(
  username: string,
  password: string,
  ssoBaseUrl?: string,
): SsoSession {
  const baseUrl = ssoBaseUrl ?? process.env.SSO_URL ?? "http://localhost:8848";

  /** 当前有效的 JSESSIONID，格式为 "JSESSIONID=abc123" */
  let cookie: string | null = null;

  /** 正在进行中的登录 Promise，防止并发重复登录 */
  let loginInFlight: Promise<void> | null = null;

  // ── 内部工具 ──────────────────────────────────────────────────────────────

  function extractJsessionId(setCookieValue: string): string | null {
    const match = setCookieValue.match(/(JSESSIONID=[^;]+)/);
    return match?.[1] ?? null;
  }

  async function doLogin(): Promise<void> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SSO 登录失败 (${res.status}): ${text}`);
    }

    // 优先使用标准多值 getSetCookie()，降级到单值 get("set-cookie")
    const setCookieHeaders: string[] =
      typeof (res.headers as any).getSetCookie === "function"
        ? (res.headers as any).getSetCookie()
        : [res.headers.get("set-cookie") ?? ""];

    let found: string | null = null;
    for (const header of setCookieHeaders) {
      found = extractJsessionId(header);
      if (found) break;
    }

    if (!found) {
      throw new Error("SSO 登录成功，但响应中未找到 JSESSIONID Cookie");
    }

    cookie = found;
  }

  async function ensureLoggedIn(): Promise<void> {
    if (cookie) return;
    if (!loginInFlight) {
      loginInFlight = doLogin().finally(() => {
        loginInFlight = null;
      });
    }
    return loginInFlight;
  }

  // ── 公开接口 ──────────────────────────────────────────────────────────────

  return {
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
      await ensureLoggedIn();

      const attachCookie = (): Promise<Response> =>
        fetch(url, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            Cookie: cookie!,
          },
        });

      let res = await attachCookie();

      // 会话过期 → 重新登录后重试一次
      if (res.status === 401) {
        cookie = null;
        await ensureLoggedIn();
        res = await attachCookie();
      }

      return res;
    },

    async logout(): Promise<void> {
      if (!cookie) return;
      try {
        await fetch(`${baseUrl}/api/v1/auth/logout`, {
          method: "POST",
          headers: { Cookie: cookie },
        });
      } finally {
        cookie = null;
      }
    },

    invalidate(): void {
      cookie = null;
    },
  };
}

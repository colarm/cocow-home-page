import type { Request, Response, NextFunction } from "express";
import { upsertLocalUser } from "../localUser/localUser.service.js";

export type AuthUser = {
  sub: string;
  name?: string;
  email?: string;
  /** 本地角色：VIEWER | ADMIN（由 cocow-home-page 独立管理，与 SSO 解耦） */
  localRole: string;
  [key: string]: unknown;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ---------------------------------------------------------------------------
// 简易令牌缓存：避免每次请求都向 SSO userinfo 端点发起网络调用
// Redis 缓存部署后可替换为 Redis 存储，TTL 保持一致即可
// ---------------------------------------------------------------------------
type CacheEntry = { user: AuthUser; expiresAt: number };
const tokenCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟

/** 从请求 Cookie 头中提取指定 name 的值，无需 cookie-parser 中间件 */
function extractCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eqIdx + 1).trim());
    }
  }
  return undefined;
}

/** 调用 SSO userinfo 端点验证令牌，结果缓存 CACHE_TTL_MS 毫秒 */
async function verifyToken(token: string): Promise<AuthUser | null> {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  const ssoBaseUrl = process.env.SSO_URL ?? "http://localhost:8848";
  try {
    const res = await fetch(`${ssoBaseUrl}/api/v1/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const ssoUser = (await res.json()) as Omit<AuthUser, "localRole"> & {
      sub: string;
    };
    if (!ssoUser.sub) return null; // 必须有 sub 字段

    // 查询（或首次自动创建）本地用户档案，注入 localRole
    const localUser = await upsertLocalUser(ssoUser.sub);
    const user: AuthUser = { ...ssoUser, localRole: localUser.role };

    tokenCache.set(token, { user, expiresAt: Date.now() + CACHE_TTL_MS });
    return user;
  } catch {
    return null;
  }
}

/**
 * requireAuth 中间件
 *
 * 从 HttpOnly cookie `auth_token` 中读取访问令牌，向 SSO userinfo 端点验证，
 * 验证通过后将用户信息挂载到 `req.user`。
 * 验证失败或令牌缺失时返回 401。
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractCookie(req, "auth_token");

  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const user = await verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  req.user = user;
  next();
};

/**
 * requireRole 中间件工厂
 *
 * 先执行 requireAuth，再检查 req.user.localRole 是否在允许列表内。
 * 不满足时返回 403。
 *
 * 示例：router.get("/admin", requireRole("ADMIN"), handler)
 */
export const requireRole =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 先过 requireAuth
    await requireAuth(req, res, async () => {
      if (!req.user || !roles.includes(req.user.localRole)) {
        res.status(403).json({ error: "forbidden" });
        return;
      }
      next();
    });
  };

/**
 * optionalAuth 中间件
 *
 * 与 requireAuth 逻辑相同，但令牌缺失或验证失败时不返回 401，
 * 而是直接放行（req.user 保持 undefined）。
 * 适用于"已登录显示个性化内容，未登录显示默认内容"的场景。
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractCookie(req, "auth_token");
  if (token) {
    const user = await verifyToken(token);
    if (user) req.user = user;
  }
  next();
};

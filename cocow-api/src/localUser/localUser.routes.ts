import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import {
  listLocalUsers,
  updateLocalUserRole,
  type LocalRole,
} from "./localUser.service.js";

const router = Router();

/**
 * GET /api/v1/local-users?page=0&size=20
 * 分页获取本地用户列表，仅 ADMIN 可访问
 */
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const page = Math.max(0, Number(req.query.page ?? 0));
  const size = Math.min(100, Math.max(1, Number(req.query.size ?? 20)));
  const result = await listLocalUsers(page, size);
  res.json(result);
});

/**
 * PATCH /api/v1/local-users/:sub/role
 * 修改指定用户角色，仅 ADMIN 可访问
 * Body: { "role": "VIEWER" | "ADMIN" }
 */
router.patch("/:sub/role", requireRole("ADMIN"), async (req, res) => {
  const sub = req.params.sub as string;
  const { role } = req.body as { role?: string };

  if (!role || !["VIEWER", "ADMIN"].includes(role)) {
    return res
      .status(400)
      .json({ error: "invalid_role", message: "role must be VIEWER or ADMIN" });
  }

  // 管理员不能修改自己的角色
  if (req.user?.sub === sub) {
    return res
      .status(400)
      .json({
        error: "self_role_change",
        message: "Cannot change your own role",
      });
  }

  try {
    const updated = await updateLocalUserRole(sub, role as LocalRole);
    return res.json(updated);
  } catch (err: unknown) {
    // Prisma P2025: record not found
    if ((err as { code?: string }).code === "P2025") {
      return res.status(404).json({ error: "not_found" });
    }
    throw err;
  }
});

export default router;

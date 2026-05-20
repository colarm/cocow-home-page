import prisma from "../prisma.js";

export type LocalRole = "VIEWER" | "ADMIN";

/**
 * 根据 SSO sub 查询本地用户；不存在时自动创建，默认角色 VIEWER。
 * 用于 SSO 登录回调和 auth 中间件两个入口。
 */
export async function upsertLocalUser(
  sub: string,
): Promise<{ sub: string; role: string }> {
  return prisma.localUser.upsert({
    where: { sub },
    create: { sub, role: "VIEWER" },
    update: {},
    select: { sub: true, role: true },
  });
}

/** 获取单个本地用户；不存在返回 null */
export async function getLocalUser(
  sub: string,
): Promise<{ sub: string; role: string } | null> {
  return prisma.localUser.findUnique({
    where: { sub },
    select: { sub: true, role: true },
  });
}

/** 分页获取本地用户列表 */
export async function listLocalUsers(page: number, size: number) {
  const [users, total] = await Promise.all([
    prisma.localUser.findMany({
      skip: page * size,
      take: size,
      orderBy: { createdAt: "desc" },
      select: { sub: true, role: true, createdAt: true, updatedAt: true },
    }),
    prisma.localUser.count(),
  ]);
  return { users, total, page, size, totalPages: Math.ceil(total / size) };
}

/** 修改用户角色（管理员专用） */
export async function updateLocalUserRole(
  sub: string,
  role: LocalRole,
): Promise<{ sub: string; role: string }> {
  return prisma.localUser.update({
    where: { sub },
    data: { role },
    select: { sub: true, role: true },
  });
}

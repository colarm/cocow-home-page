import prisma from "../prisma.js";

// ---------------------------------------------------------------------------
// 初始化
// ---------------------------------------------------------------------------

/**
 * 首次登录初始化：将全局网站目录全量复制到用户的个人列表。
 *
 * - 使用 createMany + skipDuplicates 保证幂等，并发重复调用安全。
 * - displayOrder 按全局目录的 createdAt 升序编号，保持一致的初始顺序。
 */
export const initUserWebsitesFromGlobal = async (userId: string) => {
  const allWebsites = await prisma.website.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  await prisma.userWebsite.createMany({
    data: allWebsites.map((w, i) => ({
      userId,
      websiteId: w.id,
      displayOrder: i,
    })),
    skipDuplicates: true,
  });
};

// ---------------------------------------------------------------------------
// 查询
// ---------------------------------------------------------------------------

/**
 * 获取指定用户的个人网站列表。
 *
 * 排序规则：置顶项优先（isPinned DESC），再按用户自定义顺序（displayOrder ASC），
 * 最后按加入时间（createdAt ASC）保证稳定排序。
 *
 * 网站详情及分类由 JOIN 一并返回，后续部署 Redis 后可将 website + category
 * 数据替换为从 Redis 读取，本函数只查询 user_websites 表后再批量查缓存。
 */
export const getUserWebsites = async (userId: string) => {
  return prisma.userWebsite.findMany({
    where: { userId },
    orderBy: [
      { isPinned: "desc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      website: {
        include: { category: true },
      },
    },
  });
};

// ---------------------------------------------------------------------------
// 增删改
// ---------------------------------------------------------------------------

/**
 * 将一个网站加入用户的个人列表。
 * 若已存在则幂等返回现有记录（不重复写入）。
 */
export const addUserWebsite = async (
  userId: string,
  websiteId: string,
  displayOrder = 0,
) => {
  return prisma.userWebsite.upsert({
    where: { uq_user_website: { userId, websiteId } },
    create: { userId, websiteId, displayOrder },
    update: {}, // 已存在则保持不变
    include: { website: { include: { category: true } } },
  });
};

/**
 * 从用户的个人列表中移除指定网站。
 * 若记录不存在，Prisma 会抛出 P2025 错误，由调用层处理。
 *
 * Redis 缓存失效：调用方应在此操作后删除 `user:websites:{userId}`。
 */
export const removeUserWebsite = async (userId: string, websiteId: string) => {
  return prisma.userWebsite.delete({
    where: { uq_user_website: { userId, websiteId } },
  });
};

/**
 * 更新用户网站条目的个人设置（排序位置、置顶状态）。
 */
export const updateUserWebsite = async (
  userId: string,
  websiteId: string,
  data: { displayOrder?: number; isPinned?: boolean },
) => {
  return prisma.userWebsite.update({
    where: { uq_user_website: { userId, websiteId } },
    data,
    include: { website: { include: { category: true } } },
  });
};

/**
 * 批量更新用户网站列表的排列顺序（原子事务）。
 *
 * items 中只需包含顺序发生变化的条目，未包含的条目保持不变。
 * Redis 缓存失效：完成后删除 `user:websites:{userId}`。
 */
export const batchReorderUserWebsites = async (
  userId: string,
  items: { websiteId: string; displayOrder: number }[],
) => {
  return prisma.$transaction(
    items.map(({ websiteId, displayOrder }) =>
      prisma.userWebsite.update({
        where: { uq_user_website: { userId, websiteId } },
        data: { displayOrder },
      }),
    ),
  );
};

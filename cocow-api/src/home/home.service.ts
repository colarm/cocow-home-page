import prisma from "../prisma.js";
import { initUserWebsitesFromGlobal } from "../userWebsites/userWebsites.service.js";

export const fetchCategories = async () => {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
  });
};

type WebsiteListFilters = {
  categoryId?: string;
  featured?: boolean;
};

export const fetchWebsites = async (filters: WebsiteListFilters) => {
  const where: any = {};
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.featured) {
    where.isFeatured = true;
  }

  return prisma.website.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
};

export const fetchWebsiteById = async (id: string) => {
  return prisma.website.findUnique({
    where: { id },
    include: { category: true },
  });
};

/**
 * 获取指定用户的个性化网站列表。
 *
 * - 若用户尚无任何记录（首次登录），先异步初始化，再立即返回全局默认列表。
 * - 之后按用户自定义顺序（isPinned DESC → displayOrder ASC → createdAt ASC）返回。
 */
export const fetchWebsitesForUser = async (
  userId: string,
  filters: WebsiteListFilters = {},
) => {
  const count = await prisma.userWebsite.count({ where: { userId } });

  if (count === 0) {
    // 首次登录：异步初始化，不阻塞当次响应
    initUserWebsitesFromGlobal(userId).catch((err) =>
      console.error("[initUserWebsites] failed for user", userId, err),
    );
    return fetchWebsites(filters);
  }

  const userWebsites = await prisma.userWebsite.findMany({
    where: { userId },
    orderBy: [
      { isPinned: "desc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      website: { include: { category: true } },
    },
  });

  let websites = userWebsites.map((uw) => uw.website);

  if (filters.categoryId) {
    websites = websites.filter((w) => w.categoryId === filters.categoryId);
  }
  if (filters.featured) {
    websites = websites.filter((w) => w.isFeatured === true);
  }

  return websites;
};

export const searchWebsitesByName = async (searchTerm: string) => {
  return prisma.website.findMany({
    where: {
      name: { contains: searchTerm, mode: "insensitive" },
    },
    orderBy: [{ createdAt: "desc" }],
    include: { category: true },
  });
};

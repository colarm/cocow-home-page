import prisma from "../prisma.js";

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

export const searchWebsitesByName = async (searchTerm: string) => {
  return prisma.website.findMany({
    where: {
      name: { contains: searchTerm, mode: "insensitive" },
    },
    orderBy: [{ createdAt: "desc" }],
    include: { category: true },
  });
};

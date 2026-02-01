import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Search websites
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const searchTerm = q as string;

    const websites = await prisma.website.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
      orderBy: [{ createdAt: "desc" }],
      include: { category: true },
    });

    res.json(websites);
  } catch (error) {
    console.error("Error searching websites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import type { Request, Response } from "express";
import {
  fetchCategories,
  fetchWebsiteById,
  fetchWebsites,
  searchWebsitesByName,
} from "./home.service.js";

// Health check endpoint
export const health = (req: Request, res: Response) => {
  res.json({ status: "ok" });
};

// Get list of categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get list of websites with optional filters
export const getWebsites = async (req: Request, res: Response) => {
  try {
    const { category, featured } = req.query;

    const filters: { categoryId?: string; featured?: boolean } = {};
    if (typeof category === "string") {
      filters.categoryId = category;
    }
    if (featured === "true") {
      filters.featured = true;
    }

    const websites = await fetchWebsites(filters);
    res.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get website by ID
export const getWebsiteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: 'Parameter "id" is required' });
    }

    const website = await fetchWebsiteById(id);

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    res.json(website);
  } catch (error) {
    console.error("Error fetching website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search websites by name
export const searchWebsites = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (typeof q !== "string" || !q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const websites = await searchWebsitesByName(q);
    res.json(websites);
  } catch (error) {
    console.error("Error searching websites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

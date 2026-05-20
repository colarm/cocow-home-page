import type { Request, Response } from "express";
import {
  addUserWebsite,
  batchReorderUserWebsites,
  getUserWebsites,
  removeUserWebsite,
  updateUserWebsite,
} from "./userWebsites.service.js";

// GET /user-websites
export const listUserWebsites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const list = await getUserWebsites(userId);
    res.json(list);
  } catch (error) {
    console.error("Error fetching user websites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /user-websites
export const addToUserWebsites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { websiteId, displayOrder } = req.body as {
      websiteId?: unknown;
      displayOrder?: unknown;
    };

    if (typeof websiteId !== "string" || !websiteId) {
      res.status(400).json({ error: '"websiteId" is required' });
      return;
    }

    const order = typeof displayOrder === "number" ? displayOrder : undefined;

    const entry = await addUserWebsite(userId, websiteId, order);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error adding user website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /user-websites/:websiteId
export const removeFromUserWebsites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const websiteId = req.params["websiteId"];

    if (typeof websiteId !== "string") {
      res.status(400).json({ error: '"websiteId" param is required' });
      return;
    }

    await removeUserWebsite(userId, websiteId);
    res.status(204).send();
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      res.status(404).json({ error: "Website not found in user list" });
      return;
    }
    console.error("Error removing user website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /user-websites/:websiteId
export const patchUserWebsite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const websiteId = req.params["websiteId"];

    if (typeof websiteId !== "string") {
      res.status(400).json({ error: '"websiteId" param is required' });
      return;
    }

    const { displayOrder, isPinned } = req.body as {
      displayOrder?: unknown;
      isPinned?: unknown;
    };

    const data: { displayOrder?: number; isPinned?: boolean } = {};
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;
    if (typeof isPinned === "boolean") data.isPinned = isPinned;

    if (Object.keys(data).length === 0) {
      res
        .status(400)
        .json({
          error: 'At least one of "displayOrder" or "isPinned" is required',
        });
      return;
    }

    const entry = await updateUserWebsite(userId, websiteId, data);
    res.json(entry);
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      res.status(404).json({ error: "Website not found in user list" });
      return;
    }
    console.error("Error updating user website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /user-websites/reorder
export const reorderUserWebsites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { items } = req.body as {
      items?: unknown;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: '"items" must be a non-empty array' });
      return;
    }

    const parsed = items.map((item: unknown) => {
      const i = item as { websiteId?: unknown; displayOrder?: unknown };
      if (
        typeof i.websiteId !== "string" ||
        typeof i.displayOrder !== "number"
      ) {
        throw new TypeError(
          "Each item must have websiteId (string) and displayOrder (number)",
        );
      }
      return { websiteId: i.websiteId, displayOrder: i.displayOrder };
    });

    const results = await batchReorderUserWebsites(userId, parsed);
    res.json(results);
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error("Error reordering user websites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

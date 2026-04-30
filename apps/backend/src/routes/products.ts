import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

const router: ExpressRouter = Router();

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "name_asc", "newest"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

// GET /api/products
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = querySchema.safeParse(req.query);
  const { search, category, sort, page, limit } = parsed.success
    ? parsed.data
    : querySchema.parse({});

  const where: NonNullable<
    Parameters<typeof prisma.product.findMany>[0]
  >["where"] = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const orderByMap: Record<
    string,
    NonNullable<Parameters<typeof prisma.product.findMany>[0]>["orderBy"]
  > = {
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    name_asc: { name: "asc" as const },
    newest: { createdAt: "desc" as const },
  };

  const orderBy = sort ? orderByMap[sort] : { createdAt: "desc" as const };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;

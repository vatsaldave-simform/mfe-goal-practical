import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";
import type { User } from "../../generated/prisma/client";

type AuthRequest = Request & { user: User };

const router: ExpressRouter = Router();

const orderIdSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/orders — list all orders for the authenticated user
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as AuthRequest).user;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });

  res.json({
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
  });
});

// GET /api/orders/:id — get a single order by id for the authenticated user
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as AuthRequest).user;

  const parsed = orderIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }
  const { id } = parsed.data;

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          name: true,
          price: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  res.json({
    id: order.id,
    userId: order.userId,
    status: order.status,
    total,
    createdAt: order.createdAt,
    items: order.items,
  });
});

// POST /api/orders — create an order from the current cart
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as AuthRequest).user;

  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return null;
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: "pending",
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  if (!order) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  res.status(201).json({
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items,
  });
});

export default router;

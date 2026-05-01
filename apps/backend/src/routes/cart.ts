import { Router, type Router as ExpressRouter } from "express";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import type { Request, Response } from "express";
import type { User } from "../../generated/prisma/client";
import {
  addToCartSchema,
  updateCartItemSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
} from "@mfe/shared";

type AuthRequest = Request & { user: User };

const router: ExpressRouter = Router();

// GET /api/cart
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as AuthRequest).user;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, image: true },
          },
        },
      },
    },
  });

  if (!cart) {
    res.json({ id: null, items: [], total: 0, itemCount: 0 });
    return;
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    })),
    total,
    itemCount,
  });
});

// POST /api/cart/items
router.post(
  "/items",
  validate(addToCartSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = (req as AuthRequest).user;
    const { productId, quantity } = req.body as AddToCartInput;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Lazily create the cart if it doesn't exist
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Upsert cart item — increment if exists, create if new
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: {
        product: {
          select: { id: true, name: true, price: true, image: true },
        },
      },
    });

    res.status(existingItem ? 200 : 201).json(item);
  },
);

// PATCH /api/cart/items/:id
router.patch(
  "/items/:id",
  validate(updateCartItemSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = (req as AuthRequest).user;
    const { id } = req.params;
    const { quantity } = req.body as UpdateCartItemInput;

    // Find item scoped to the user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId },
      },
    });

    if (!item) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: { select: { id: true, name: true, price: true, image: true } },
      },
    });

    res.json(updated);
  },
);

// DELETE /api/cart/items/:id
router.delete(
  "/items/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = (req as AuthRequest).user;
    const { id } = req.params;

    // Find item scoped to the user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId },
      },
    });

    if (!item) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    await prisma.cartItem.delete({ where: { id } });

    res.json({ message: "Item removed" });
  },
);

export default router;

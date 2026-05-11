import { Router, type Router as ExpressRouter } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { validate } from "../middleware/validate";
import { auth } from "../middleware/auth";
import type { Request, Response } from "express";
import type { User } from "../../generated/prisma/client";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@mfe/shared";

const router: ExpressRouter = Router();

function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function safeUser(user: User) {
  const { password: _password, ...rest } = user;
  return rest;
}

// POST /register
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body as RegisterInput;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    const token = signToken(user.id);
    setTokenCookie(res, token);
    res.status(201).json({ user: safeUser(user) });
  },
);

// POST /login
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user.id);
    setTokenCookie(res, token);
    res.json({ user: safeUser(user) });
  },
);

// POST /logout
router.post("/logout", (_req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// GET /me
router.get("/me", auth, (req: Request, res: Response): void => {
  const user = (req as Request & { user: User }).user;
  res.json({ user: safeUser(user) });
});

export default router;

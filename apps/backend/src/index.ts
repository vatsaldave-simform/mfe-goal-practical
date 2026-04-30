import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3003;

// Middleware pipeline
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

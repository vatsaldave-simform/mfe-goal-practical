import express from "express";

const app = express();
const PORT = 3003;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

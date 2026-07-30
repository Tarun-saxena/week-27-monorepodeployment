import "dotenv/config";
import express from "express";
import { prisma } from "@repo/db";

const app = express();
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const userCount = await prisma.user.findMany();
    res.json({ ok: true, userCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "DB query failed" });
  }
});

app.listen(4000, () => console.log("http-server running on :4000"));
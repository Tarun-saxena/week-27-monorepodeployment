import "dotenv/config";

import express from "express";
import cors from "cors";
import { prisma } from "@repo/db";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    message: "HTTP Server Running 🚀",
  });
});

// Get all todos
app.get("/todos", async (_, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(todos);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch todos",
    });
  }
});

// Create todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
      },
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to create todo",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
});
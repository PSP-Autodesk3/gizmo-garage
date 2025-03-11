import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Router imports
import projectsRouter from "./routes/projects.js";
import usersRouter from "./routes/users.js"
import foldersRouter from "./routes/folders.js";
import itemsRouter from "./routes/items.js";
import databaseRouter from "./routes/database.js";
import tagsRouter from "./routes/tags.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Routes
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use("/folders", foldersRouter);
app.use("/items", itemsRouter);
app.use("/database", databaseRouter)
app.use("/tags", tagsRouter);

// Error handling middleware.
app.use((err, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3001, () => console.log("Backend API running on port 3001"));
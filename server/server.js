import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initializeApp, cert } from 'firebase-admin/app';

// Initialise Firebase Admin
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase Admin initialised successfully');
} catch (error) {
  console.error('Firebase Admin initialisation error:', error);
}


// Router imports
import projectsRouter from "./routes/projects.js";
import usersRouter from "./routes/users.js"
import foldersRouter from "./routes/folders.js";
import itemsRouter from "./routes/items.js";
import databaseRouter from "./routes/database.js";
import tagsRouter from "./routes/tags.js";
import editorsRouter from "./routes/editors.js";
import invitesRouter from "./routes/invites.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

const startDatabase = async () => {
  const exists = await fetch("http://localhost:3001/database/exists");
  const response = await exists.json();
  if (response?.DatabaseExists === 0) {
    await fetch("http://localhost:3001/database/create");
  }
}
startDatabase();

// Routes
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use("/folders", foldersRouter);
app.use("/items", itemsRouter);
app.use("/database", databaseRouter)
app.use("/tags", tagsRouter);
app.use("/editors", editorsRouter);
app.use("/invites", invitesRouter);

// Error handling middleware.
app.use((err, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3001, () => console.log("Backend API running on port 3001"));
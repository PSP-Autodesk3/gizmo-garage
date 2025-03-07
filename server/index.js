import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); 

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.post("/projects", async (req, res) => {
  try {
    const { name, owner } = req.body;

    const [rows] = await pool.execute(
      "INSERT INTO Projects (name, owner) VALUES (?, ?)",
      [name, owner]
    );

    res.json({ message: "Project created successfully", project_id: rows.insertId });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.listen(3001, () => console.log("Backend API running on port 3001"));
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

app.post("/createProjects", async (req, res) => {
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

app.post("/createFolder", async (req, res) => {
  try {
    const { name, projectid, folder_id, type } = req.body;
    const params = [name, projectid];
    if (type !== 1) params.push(folder_id);
    params.push(projectid);
    params.push(name, projectid);
    if (type !== 1) params.push(folder_id);

    const [result] = await pool.execute(
      `
      INSERT INTO Folder (name, project_id, parent_folder_id)
      SELECT ?, ?, ${type === 1 ? `NULL` : `?`}
      FROM Projects
      WHERE name = (SELECT name FROM Projects WHERE Projects.project_id = ?)
      AND NOT EXISTS (
        SELECT 1 FROM Folder 
        WHERE name = ? 
        AND project_id = ?
        AND parent_folder_id ${type === 1 ? `IS NULL` : `= ?`}
      );
      `, params
    );
    res.json({ message: "Folder created successfully", affectedRows: result.affectedRows });
  }
  catch (error) {
    console.error("Database error: ", error);
    res.status(500), json({ error: "Failed to create folder" });
  }
});

app.post("/createItem", async (req, res) => {
  try {
    const { itemName, email, project, type, id } = req.body;

    const params = [itemName, email, project];
    if (type !== 1) {
      params.push(id);
    } else {
      params.push(null);
    }

    const [result] = await pool.execute(`
      INSERT INTO Object
        (name, author, project_id, folder_id)
        VALUES (?, 
        (SELECT user_id FROM Users WHERE email = ?),
        ?, ?)
    `, params);
    res.json({ message: "Object created successfully", affectedRows: result.affectedRows });
  }
  catch (error) {
    console.error("Database error: ", error);
    res.status(500), json({ error: "Failed to create item" });
  }
});

app.listen(3001, () => console.log("Backend API running on port 3001"));
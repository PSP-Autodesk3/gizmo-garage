import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create project
router.post("/create", async (req, res, next) => {
    try {
        const { name, owner } = req.body;

        const [rows] = await pool.execute(
        "INSERT INTO Projects (name, owner) VALUES (?, ?)",
        [name, owner]
        );

        res.json({ message: "Project created successfully", project_id: rows.insertId });
    }
    catch (error) {
        next(error);
    }
});

// Change project name
router.post("/change-name", async (req, res, next) => {
    try {
        console.log("body:", req.body);
        const {name, id} = req.body;
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Missing 'name' parameter" });
        }
        const [rows] = await pool.execute(`
            UPDATE Projects
            SET name = ?
            WHERE project_id = ?
        `, [name, id]);
        res.json({ message: "Updated project name", project_id: rows.insertId });
    }
    catch (error) {
        next(error);
    }
})

export default router;
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

export default router;
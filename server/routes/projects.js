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

// Get projects
router.post("/get", async (req, res, next) => {
    try {
        const {email} = req.body;
        const [result] = await pool.execute(`
            SELECT Projects.project_id, Projects.name, 
            CASE WHEN Projects.owner = Users.user_id THEN 1 ELSE 0 END AS ownsProject
            FROM Projects
            INNER JOIN Users ON Users.email = ?
            LEFT JOIN Editor ON Editor.project_id = Projects.project_id AND Editor.user_id = Users.user_id
            WHERE Projects.owner = Users.user_id OR Editor.user_id IS NOT NULL;
        `, [email]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;
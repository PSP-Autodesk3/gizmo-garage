import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all tags
router.get("/getAll", async (_req, res, next) => {
    try {
        const [result] = await pool.execute("SELECT * FROM Tag");
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

// Get object tags
router.get("/getObject", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT object_id, Tag.tag
            FROM Object_Tag
            INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
            WHERE object_id IN ( SELECT object_id
            FROM Object)`)
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

// Get folder tags
router.post("/getFolder", async (req, res, next) => {
    try {
        const {projectid} = req.body;
        const [result] = await pool.execute(`
            SELECT *
            FROM Object_Tag
            INNER JOIN Object ON Object_Tag.object_id = Object.object_id
            INNER JOIN Folder ON Object.folder_id = Folder.folder_id
            INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
            WHERE Object.project_id = ?
        `, [projectid]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create item
router.post("/create", async (req, res, next) => {
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
        next(error);
    }
});

// Check item exists
router.post("/exists", async (req, res, next) => {
    try {
        const {name, projectid, type, folder_id} = req.body;
        const params = [name, projectid];
        if (type !== 1) params.push(folder_id);
        const [result] = await pool.execute(`
            SELECT COUNT(*) AS ItemExists
                FROM Object
                WHERE name = ?
                AND project_id = ?
                AND folder_id ${type === 1 ? `IS NULL` : `= ?`};
            `, params
        );
        return res.json(result[0]);
    }
    catch (error) {
        next(error);
    }
});

// Get items
router.post("/get", async (req, res, next) => {
    try {
        const { id, type } = req.body;
        const [result] = await pool.execute(`
            SELECT *
            FROM Object
            WHERE Object.folder_id ${type === 1 ? "IS NULL AND Object.project_id " : "" }= ?
        `, [id]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

// Retrieve info
router.post("/info", async (req, res, next) => {
    try {
        const { id } = req.body;
        const [result] = await pool.execute(`
            SELECT *
            FROM Object
            INNER JOIN Users ON Object.author = Users.user_id
            WHERE object_id = ?;
        `, [id]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;
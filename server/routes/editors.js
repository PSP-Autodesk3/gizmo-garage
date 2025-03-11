import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/add", async (req, res, next) => {
    try {
        const { email, project } = req.body;

        const [result] = await pool.execute(`
        INSERT INTO Editor (user_id, project_id)
        VALUES ((SELECT user_id FROM Users WHERE email = ?), ?)
        `, [email, project]
        );

        res.json({ message: "Editor added", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;
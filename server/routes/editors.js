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

//gets project editors
router.post('/getEditors', async (req, res, next) => {
    try {
        const { email } = req.body;

        const [result] = await pool.execute(`
            SELECT editor.project_id, users.email
            FROM editor
            INNER JOIN users ON editor.user_id = users.user_id
            WHERE editor.project_id IN (
            SELECT projects.project_id
            FROM projects
            INNER JOIN users ON users.email = ?
            LEFT JOIN editor ON editor.project_id = projects.project_id AND editor.user_id = users.user_id
            WHERE projects.owner = users.user_id OR editor.user_id IS NOT NULL
            );
        `, [email]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;
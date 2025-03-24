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
            SELECT Editor.project_id, Users.email
            FROM Editor
            INNER JOIN Users ON Editor.user_id = Users.user_id
            WHERE Editor.project_id IN (
            SELECT Projects.project_id
            FROM Projects
            INNER JOIN Users ON Users.email = ?
            LEFT JOIN Editor ON Editor.project_id = Projects.project_id AND Editor.user_id = Users.user_id
            WHERE Projects.owner = Users.user_id OR Editor.user_id IS NOT NULL
            );
        `, [email]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;
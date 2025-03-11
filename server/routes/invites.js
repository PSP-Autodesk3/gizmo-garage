import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/remove", async (req, res, next) => {
    try {
        const { owner, project, email } = req.body;

        const [result] = await pool.execute(`
            DELETE Invite FROM Invite
            INNER JOIN Users ON Invite.user_id = Users.user_id
            INNER JOIN Projects ON Invite.project_id = Projects.project_id
            WHERE owner = ? AND Projects.name = ? AND Users.user_id = (SELECT user_id FROM Users WHERE email = ?)
        `, [owner, project, email]
        );

        res.json({ message: "Invite deleted", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/send", async (req, res, next) => {
    try {
        const { email, project } = req.body;

        const [result] = await pool.execute(`
            INSERT INTO Invite (user_id, project_id)
            SELECT user_id, project_id
            FROM Users, Projects
            WHERE Users.email = ? AND Projects.name = ?;
        `, [email, project]
        );

        res.json({ message: "Invite sent", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
})

router.post("/get", async (req, res, next) => {
    try {
        const { email } = req.body;

        const [result] = await pool.execute(`
            SELECT Projects.name AS project, Projects.project_id, CONCAT(Author.fname, ' ', Author.lname) AS author, Author.user_id
            FROM Invite
            INNER JOIN Users ON Invite.user_id = Users.user_id
            INNER JOIN Projects ON Invite.project_id = Projects.project_id
            INNER JOIN Users AS Author ON Projects.owner = Author.user_id
            WHERE Users.email = ?
        `, [email]
        );

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

export default router;
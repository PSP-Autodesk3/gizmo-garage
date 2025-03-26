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
router.post("/changeName", async (req, res, next) => {
    try {
        console.log("body:", req.body);
        const { name, id } = req.body;
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
        const { email } = req.body;
        const [result] = await pool.execute(`
            SELECT Projects.project_id, Projects.name, Projects.dateOfCreation,
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

// Get project editors
router.post("/getProjectEditors", async (req, res, next) => {
    try {
        const { email } = req.body;
        const [result] = await pool.execute(`
            SELECT Projects.project_id, Projects.name, Projects.dateOfCreation,
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

router.post("/details", async (req, res, next) => {
    try {
        const { id } = req.body;

        const [result] = await pool.execute(`
            SELECT *
            FROM Projects
            WHERE project_id = ?
        `, [id]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

router.post("/editors", async (req, res, next) => {
    try {
        const { project_id } = req.body;

        const [result] = await pool.execute(`
            SELECT email, Users.user_id
            FROM Users
            INNER JOIN Editor ON  Users.user_id = Editor.user_id
            INNER JOIN Projects ON Editor.project_id = Projects.project_id
            WHERE Projects.project_id = ?
        `, [project_id]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

router.post("/invited", async (req, res, next) => {
    try {
        const { project_id } = req.body;

        const [result] = await pool.execute(`
            SELECT email
            FROM Users
            INNER JOIN Invite ON  Users.user_id = Invite.user_id
            INNER JOIN Projects ON Invite.project_id = Projects.project_id
            WHERE Projects.project_id = ?
        `, [project_id]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

router.post("/exists", async (req, res, next) => {
    try {
        const { name, email } = req.body;

        const [result] = await pool.execute(`
            SELECT COUNT(*) AS ProjectExists
            FROM Projects
            WHERE name = ? AND owner = (SELECT user_id FROM Users WHERE email = ?)
        `, [name, email]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

router.post("/tags", async (req, res, next) => {
    try {
        const { email } = req.body;

        const [result] = await pool.execute(`
            SELECT DISTINCT Object.project_id, Tag.tag
            FROM Object_Tag
            INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
            INNER JOIN Object ON Object_Tag.object_id = Object.object_id
            WHERE Object.project_id IN (SELECT Projects.project_id
            FROM Projects
            INNER JOIN Users ON Users.email = ?
            LEFT JOIN Editor ON Editor.project_id = Projects.project_id AND Editor.user_id = Users.user_id
            WHERE Projects.owner = Users.user_id OR Editor.user_id IS NOT NULL);
        `, [email]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

router.post("/removeEditor", async (req, res, next) => {
    try {
        const { project_id, user_id } = req.body;
        const [result] = await pool.execute(`
            DELETE FROM
            Editor
            WHERE Editor.user_id = ? AND Editor.project_id = ?
        `, [user_id, project_id]);

        console.log(result);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
})

router.post("/removeInvite", async (req, res, next) => {
    try {
        const { project_id, user_id } = req.body;

        const [result] = await pool.execute(`
            DELETE FROM
            Invite
            WHERE Invite.user_id = ? AND Invite.project_id = ?
        `, [user_id, project_id]);

        res.json(result);
    }
    catch (error) {
        next(error);
    }
})
export default router;
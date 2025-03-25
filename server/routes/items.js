import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create item
router.post("/create", async (req, res, next) => {
    try {
        const { itemName, email, project, type, id, bucketKey, appliedTags } = req.body;
        const params = [itemName, email, project];
        if (type !== 1) {
            params.push(id);
        } else {
            params.push(null);
        }
        params.push(bucketKey || null); // Add bucketKey after folder check
        const [result] = await pool.execute(`
            INSERT INTO Object
            (name, author, project_id, folder_id, bucket_id)
            VALUES (?, 
            (SELECT user_id FROM Users WHERE email = ?),
            ?, ?, ?)
        `, params);

        // Get the ID of the item just created
        const latestId = result.insertId //found that i can get the primary key of the previously inserted record using insertId from here: https://www.webslesson.info/2023/08/how-to-get-last-inserted-id-in-nodejs-using-mysql.html
        // Insert tags into object_tag table
        for (const tag of appliedTags) {
            await pool.execute(`
                INSERT INTO Object_Tag
                (object_id, tag_id)
                VALUES (?, ?)   
            `, [latestId, tag.tag_id]);
        }

        res.json({ message: "Object created successfully", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }

});

// Check item exists
router.post("/exists", async (req, res, next) => {
    try {
        const { name, projectid, type, folder_id } = req.body;
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
        const { id } = req.body;
        const [result] = await pool.execute(`
            SELECT *
            FROM Object
            WHERE Object.project_id = ?
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
            INNER JOIN Projects ON Object.project_id = Projects.project_id
            WHERE object_id = ?;
        `, [id]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

router.post("/archive", async (req, res, next) => {
    try {
        const { id, action } = req.body;
        if (action === "archive") {
            await pool.execute(`
                UPDATE Object
                SET archived = 1
                WHERE object_id = ?
            `, [id]);
            res.json({ message: "Item archived" });
        } else if (action === "unarchive") {
            await pool.execute(`
                UPDATE Object
                SET archived = 0
                WHERE object_id = ?
            `, [id]);
            res.json({ message: "Item unarchived" });
        }
    }
    catch (error) {
        next(error);
    }
});

export default router;
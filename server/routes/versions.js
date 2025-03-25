import express from "express";
import pool from "../db.js";

const router = express.Router();

// Tag version
router.post("/tag", async (req, res, next) => {
    try {
        const { version, bucket_id, urn, object_key } = req.body;
        if (!version || !bucket_id || !urn) {
            throw new Error("Missing required fields");
        }
        const [result] = await pool.execute(`
            INSERT INTO Version
            (bucket_id, version, urn, object_key, date_time)
            VALUES (?, ?, ?, ?, NOW())
        `, [bucket_id, version, urn, object_key]);
        res.json({ message: "Version tagged successfully", affectedRows: result.affectedRows, version_id: result.insertId });
    }
    catch (error) {
        next(error);
    }
});

// Get latest version
router.post("/latestVersion", async (req, res, next) => {
    try {
        const { bucket_id } = req.body;
        if (!bucket_id) {
            throw new Error("Missing required fields");
        }
        const [result] = await pool.execute(`
            SELECT version
            FROM Version
            WHERE bucket_id = ?
            ORDER BY version DESC
            LIMIT 1
        `, [bucket_id]);
        if (result.length === 0) {
            throw new Error("No versions found");
        }
        res.json({ version: result[0].version });
    }
    catch (error) {
        next(error);
    }
});

// Get all versions
router.post("/allVersions", async (req, res, next) => {
    try {
        const { bucket_id } = req.body;
        if (!bucket_id) {
            throw new Error("Missing required fields");
        }
        const [result] = await pool.execute(`
            SELECT version, urn, object_key, date_time
            FROM Version
            WHERE bucket_id = ?
            ORDER BY version DESC
        `, [bucket_id]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

// Rollback to previous version
router.post("/rollback", async (req, res, next) => {
    try {
        const { bucket_id, version } = req.body;
        if (!bucket_id || !version) {
            throw new Error("Missing required fields");
        }
        const [result] = await pool.execute(`
            DELETE FROM Version
            WHERE bucket_id = ? AND version > ?
        `, [bucket_id, version]);
        res.json({ message: "Version rolled back successfully", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;
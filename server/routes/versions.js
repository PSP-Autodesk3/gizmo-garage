import express from "express";
import pool from "../db.js";

const router = express.Router();

// Tag version
router.post("/tag", async (req, res, next) => {
    try {
        const { version, bucket_id, urn } = req.body;
        if (!version || !bucket_id || !urn) {
            throw new Error("Missing required fields");
        }
        const [result] = await pool.execute(`
            INSERT INTO Version
            (bucket_id, version, urn, date_time)
            VALUES (?, ?, ?, NOW())
        `, [bucket_id, version, urn]);
        res.json({ message: "Version tagged successfully", affectedRows: result.affectedRows, version_id: result.insertId });
    }
    catch (error) {
        next(error);
    }
});

export default router;
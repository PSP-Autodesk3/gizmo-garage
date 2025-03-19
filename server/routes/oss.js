import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create bucket on Object Creation.
router.post("/create", async (req, res, next) => {
    try {
        const { token } = req.body;
        const key = crypto.randomUUID();
        const result = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                region: "US"
            },
            body: JSON.stringify({
                bucketKey: key,
                policyKey: "persistent"
            })
        })
        const data = await result.json();
        res.json({ bucketKey: key, ...data });
    }
    catch (error) {
        next(error);
    }
});

// Get buckets
router.post("/getBuckets", async (req, res, next) => {
    try {
        const { token } = req.body;
        const result = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "region": "US"
            }
        })
        const data = await result.json();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

export default router;
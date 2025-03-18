import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create bucket on Object Creation.
router.post("/create", async (req, res, next) => {
    try {
        const { token, id } = req.body;
        const [result] = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                region: "US"
            },
            body: JSON.stringify({
                bucketKey: id,
                policyKey: "persistent"
            })
        })
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

// Get buckets
router.get("/getBuckets", async (req, res, next) => {
    try {
        const { token } = req.body;
        const [result] = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
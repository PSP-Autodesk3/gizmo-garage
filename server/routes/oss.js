import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// Upload file to bucket
router.post("/upload", upload.single("file"), async (req, res, next) => {
    try {
        const {token, bucketKey} = req.body;
        console.log("SignedURL: Token:", token);
        const file = req.file;
        if (!file) {
            throw new Error("No file uploaded");
        }
        const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${file.originalname}/signeds3upload`;
        const result = await fetch(url, { // Get signed URL
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "region": "US"
            },
        });
        const data = await result.json();
        const { urls } = data;
        if (!urls || urls.length === 0) {
            throw new Error("No signed URL returned");
        }
        const upload = await fetch(urls[0], {
            method: "PUT",
            headers: {
                "Content-Type": file.mimetype
            },
            body: file.buffer
        });
        if (!upload.ok) {
            throw new Error("Failed to upload file");
        }
        res.json({
            message: "File uploaded successfully!",
            objectKey: file.originalname,
            bucketKey: bucketKey
        });
    }
    catch (error) {
        next(error);
    }
});

export default router;
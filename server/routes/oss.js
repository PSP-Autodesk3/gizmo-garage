import express from "express";
import multer from "multer";
import { OssClient } from "@aps_sdk/oss";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ossClient = new OssClient();

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

router.post("/upload", upload.single("file"), async (req, res, next) => {
    try {
        const {token, bucketKey} = req.body;
        const file = req.file;
        if (!file) {
            throw new Error("No file uploaded");
        }
        const fileName = file.originalname;
        const extension = fileName.substring(fileName.lastIndexOf("."));
        const fileUUID = crypto.randomUUID();
        const objectKey = `${fileUUID}${extension}`;
        const ObjectDetails = await ossClient.uploadObject(bucketKey, objectKey, file.buffer, { accessToken: token}); // Upload file to OSS: https://aps.autodesk.com/en/docs/data/v2/reference/typescript-sdk-oss/ - Adam
        console.log(ObjectDetails);
        res.json({
            message: "File uploaded successfully!",
            objectKey: objectKey,
            bucketKey: bucketKey,
            urn: ObjectDetails.objectId
        });
    }
    catch (error) {
        next(error);
    }
});

export default router;
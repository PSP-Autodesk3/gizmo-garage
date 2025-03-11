import express from "express";
import pool from "../db.js";
import { getAuth } from 'firebase-admin/auth';

const router = express.Router();

// Create user
router.post("/create", async (req, res, next) => {
    try {
        const { email, fName, lName } = req.body;
        const [result] = await pool.execute(
            "INSERT INTO Users (email, fname, lname) VALUES (?, ?, ?)", [email, fName, lName]
        )
        res.json({ message: "User created", user_id: result.insertId });
    }
    catch (error) {
        next(error);
    }
});

// Get all firebase users
router.get("/getUsers", async (req, res, next)=> {
    try {
        const adminAuth = getAuth();
        const listUsersResult = await adminAuth.listUsers();
        const users = listUsersResult.users.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email,
            disabled: userRecord.disabled
        }));

        res.json({ users });
    }
    catch (error) {
        next(error);
    }
})

// Update user status
router.put("/updateStatus", async (req, res, next) => {
    try {
        const { uid, disabled } = req.body;
        const adminAuth = getAuth();
        await adminAuth.updateUser(uid, { disabled });
        res.json({ message: "User status updated" });
    }
    catch (error) {
        next(error);
    }
});

export default router;
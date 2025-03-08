import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create item
router.post("/create", async (req, res, next) => {
    try {
        const { itemName, email, project, type, id } = req.body;
    
        const params = [itemName, email, project];
        if (type !== 1) {
          params.push(id);
        } else {
          params.push(null);
        }
    
        const [result] = await pool.execute(`
          INSERT INTO Object
            (name, author, project_id, folder_id)
            VALUES (?, 
            (SELECT user_id FROM Users WHERE email = ?),
            ?, ?)
        `, params);
        res.json({ message: "Object created successfully", affectedRows: result.affectedRows });
      }
    catch (error) {
        next(error);
    }
});

export default router;
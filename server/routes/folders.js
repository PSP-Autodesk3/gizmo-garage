import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create folder
router.post("/create", async (req, res, next) => {
  try {
      const { name, projectid, folder_id, type } = req.body;
      const params = [name, projectid];
      if (type !== 1) params.push(folder_id);
      params.push(projectid);
      params.push(name, projectid);
      if (type !== 1) params.push(folder_id);
  
      const [result] = await pool.execute(
        `
        INSERT INTO Folder (name, project_id, parent_folder_id)
        SELECT ?, ?, ${type === 1 ? `NULL` : `?`}
        FROM Projects
        WHERE name = (SELECT name FROM Projects WHERE Projects.project_id = ?)
        AND NOT EXISTS (
          SELECT 1 FROM Folder 
          WHERE name = ? 
          AND project_id = ?
          AND parent_folder_id ${type === 1 ? `IS NULL` : `= ?`}
        );
        `, params
      );
      res.json({ message: "Folder created successfully", affectedRows: result.affectedRows });
    }
  catch (error) {
      next(error);
  }
});

// Check folder exists
router.post("/exists", async (req, res, next) => {
  try {
    const {name, projectid, type, parent_folder_id} = req.body;
    const params = [name, projectid];
    if (type !== 1) params.push(parent_folder_id);
    const [result] = await pool.execute(`
        SELECT COUNT(*) AS FolderExists
            FROM Folder
            WHERE name = ?
            AND project_id = ?
            AND parent_folder_id ${type === 1 ? `IS NULL` : `= ?`};
        `, params
    );
    return res.json(result[0]);
  }
  catch (error) {
    next(error);
  }
});

export default router;
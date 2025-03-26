import express from "express";
import openPool from '../no-db.js';
import { getPool } from '../db.js';

const router = express.Router();

// Create database
router.get("/create", async (_req, res, next) => {
  try {
    // Create database, drop if exists
    await openPool.execute("DROP DATABASE IF EXISTS gizmo_garage");
    await openPool.execute("CREATE DATABASE gizmo_garage");

    const pool = getPool();

    // Create tables
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL,
          fname VARCHAR(255) NOT NULL,
          lname VARCHAR(255) NOT NULL,
          admin TINYINT(1) DEFAULT 0 NOT NULL
        );
      `);

    // Just for development, delete for final version
    await pool.execute(`
        INSERT INTO Users (user_id, email, fname, lname, admin) VALUES (1,'John.Doe@outlook.com','John','Doe', 1), (2,'User@email.com','New','User', 1);
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Projects (
          project_id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          owner INT NOT NULL,
          FOREIGN KEY (owner) REFERENCES Users(user_id),
          dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Editor (
          user_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES Users(user_id),
          project_id INT NOT NULL, 
          FOREIGN KEY (project_id) REFERENCES Projects(project_id)
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Invite (
          user_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES Users(user_id),
          project_id INT NOT NULL, 
          FOREIGN KEY (project_id) REFERENCES Projects(project_id)
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Folder (
          folder_id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          project_id INT NOT NULL,
          FOREIGN KEY (project_id) REFERENCES Projects(project_id),
          parent_folder_id INT,
          FOREIGN KEY (parent_folder_id) REFERENCES Folder(folder_id),
          dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Object (
          object_id INT PRIMARY KEY AUTO_INCREMENT,
          name varchar(50) NOT NULL,
          author INT NOT NULL,
          FOREIGN KEY (author) REFERENCES Users(user_id),
          project_id INT NOT NULL,
          FOREIGN KEY (project_id) REFERENCES Projects(project_id),
          folder_id INT,
          FOREIGN KEY (folder_id) REFERENCES Folder(folder_id),
          bucket_id varchar(128) DEFAULT NULL,
          archived TINYINT(1) DEFAULT 0,
          dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Version (
          version_id INT PRIMARY KEY AUTO_INCREMENT,
          bucket_id varchar(128) NOT NULL,
          version INT NOT NULL,
          urn varchar(255) NOT NULL,
          object_key varchar(255) NOT NULL,
          date_time DATETIME NOT NULL
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Tag (
          tag_id INT PRIMARY KEY AUTO_INCREMENT,
          tag VARCHAR(255) NOT NULL
        );
      `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Object_Tag (
          object_id INT NOT NULL,
          FOREIGN KEY (object_id) REFERENCES Object(object_id) ON DELETE CASCADE,
          tag_id INT NOT NULL,
          FOREIGN KEY (tag_id) REFERENCES Tag(tag_id) ON DELETE CASCADE
        );
      `);

    res.json({ message: "Database created successfully" });
  }
  catch (error) {
    next(error);
  }
});

// Check database exists
router.get("/exists", async (_req, res, next) => {
  try {
    const [result] = await openPool.execute(`
      SELECT COUNT(*) AS DatabaseExists
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME = 'gizmo_garage';
    `
    );
    return res.json(result[0]);
  }
  catch (error) {
    next(error);
  }
});

export default router;
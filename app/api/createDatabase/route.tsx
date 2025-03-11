import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create database, drop if exists.
    await connection.execute("DROP DATABASE IF EXISTS gizmo_garage");
    await connection.execute("CREATE DATABASE gizmo_garage");
    await connection.changeUser({ database: "gizmo_garage" });

    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        fname VARCHAR(255) NOT NULL,
        lname VARCHAR(255) NOT NULL
      );
    `);

    // Just for development, delete for final version
    await connection.execute(`
      INSERT INTO Users (user_id, email, fname, lname) VALUES (1,'John.Doe@outlook.com','John','Doe'), (2,'User@email.com','New','User');
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Projects (
        project_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        owner INT NOT NULL,
        FOREIGN KEY (owner) REFERENCES Users(user_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Editor (
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
        project_id INT NOT NULL, 
        FOREIGN KEY (project_id) REFERENCES Projects(project_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Invite (
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
        project_id INT NOT NULL, 
        FOREIGN KEY (project_id) REFERENCES Projects(project_id)
      );
    `);

    await connection.execute(`
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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Object (
        object_id INT PRIMARY KEY AUTO_INCREMENT,
        name varchar(50) NOT NULL,
        author INT NOT NULL,
        FOREIGN KEY (author) REFERENCES Users(user_id),
        project_id INT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES Projects(project_id),
        folder_id INT,
        FOREIGN KEY (folder_id) REFERENCES Folder(folder_id),
        bucket_id INT DEFAULT NULL,
        dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Version (
        version_id INT PRIMARY KEY AUTO_INCREMENT,
        object_id INT NOT NULL,
        FOREIGN KEY (object_id) REFERENCES Object(object_id),
        version INT NOT NULL,
        date_time DATETIME NOT NULL
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Tag (
        tag_id INT PRIMARY KEY AUTO_INCREMENT,
        tag VARCHAR(255) NOT NULL
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Object_Tag (
        object_id INT NOT NULL,
        FOREIGN KEY (object_id) REFERENCES Object(object_id),
        tag_id INT NOT NULL,
        FOREIGN KEY (tag_id) REFERENCES Tag(tag_id)
      );
    `);
    await connection.end();

    return NextResponse.json({ message: "Database created successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create database" }, { status: 500 });
  }
}
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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Projects (
        project_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        owner INT NOT NULL,
        FOREIGN KEY (owner) REFERENCES users(user_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Editor (
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        project_id INT NOT NULL, 
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Object (
        object_id INT PRIMARY KEY AUTO_INCREMENT,
        author INT NOT NULL,
        FOREIGN KEY (author) REFERENCES users(user_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Folder (
        folder_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        project_id INT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(project_id),
        parent_folder_id INT,
        FOREIGN KEY (parent_folder_id) REFERENCES folder(folder_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Item (
        item_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        folder_id INT NOT NULL,
        FOREIGN KEY (folder_id) REFERENCES folder(folder_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Version (
        version_id INT PRIMARY KEY AUTO_INCREMENT,
        item_id INT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES item(item_id),
        year INT NOT NULL,
        month INT NOT NULL,
        iteration INT NOT NULL
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Version_Object (
        version_id int NOT NULL,
        FOREIGN KEY (version_id) REFERENCES version(version_id),
        object_id int NOT NULL,
        FOREIGN KEY (object_id) REFERENCES object(object_id)
      );
    `);
    await connection.end();

    return NextResponse.json({ message: "Database created successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create database" }, { status: 500 });
  }
}
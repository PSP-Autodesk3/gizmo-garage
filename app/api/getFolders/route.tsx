import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(`
      SELECT *
      FROM Folder
      WHERE Folder.parent_folder_id ${type === 1 ? "IS NULL AND Folder.project_id " : "" }= ?
    `, [id]);
    
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to retrieve folders" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import mysql, { ResultSetHeader } from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, id } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute<ResultSetHeader>("INSERT INTO Projects (name, owner) VALUES (?, ?)", [name, id]);
    
    await connection.end();

    return NextResponse.json({ message: "Project created successfully", project_id: rows.insertId });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
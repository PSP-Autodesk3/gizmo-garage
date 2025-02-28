import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, project } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    await connection.execute(`
        INSERT INTO Editor (user_id, project_id)
        VALUES ((SELECT user_id FROM Users WHERE email = ?), ?)
        `, [email, project]);
    
    await connection.end();

    return NextResponse.json({ message: "Successfully deleted invite" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    if (!project_id || project_id.trim() === "") {
      return NextResponse.json({ error: "Missing 'project' parameter" }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(`
      SELECT email
      FROM Users
      INNER JOIN Invite ON  Users.user_id = Invite.user_id
      INNER JOIN Projects ON Invite.project_id = Projects.project_id
      WHERE Projects.project_id = ?
    `, [project_id]);
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to get editors" }, { status: 500 });
  }
}

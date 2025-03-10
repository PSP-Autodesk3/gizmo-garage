import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(`
      SELECT DISTINCT Object.project_id, Tag.tag
       FROM Object_Tag
       INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
       INNER JOIN Object ON Object_Tag.object_id = Object.object_id
       WHERE Object.Project_id IN (SELECT Projects.project_id
       FROM Projects
       INNER JOIN Users ON Users.email = ?
       LEFT JOIN Editor ON Editor.project_id = Projects.project_id AND Editor.user_id = Users.user_id
       WHERE Projects.owner = Users.user_id OR Editor.user_id IS NOT NULL);
   `, [email]);

   console.log(rows);

    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to check database status" }, { status: 500 });
  }
}
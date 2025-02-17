import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project, routes } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    let sql = `
        FROM Folder
        JOIN Projects ON Folder.project_id = Projects.project_id
        WHERE Folder.parent_folder_id IS NULL and Projects.name = ?
    `;

    const params: (string | number)[] = [project.replace(/%2B/g, ' ')];

    for (let i = 0; i < routes.length; i++) {
        sql = `
            FROM Folder
            WHERE Folder.parent_folder_id = (
            SELECT Folder.folder_id
        `
        + sql + `AND folder.name = ?)`;
        params.push(routes[i].replace(/%2B/g, ' '));
    }

    sql = "SELECT object.object_id, object.name" + sql;

    const [rows] = await connection.execute(sql, params);
    
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to retrieve folders" }, { status: 500 });
  }
}
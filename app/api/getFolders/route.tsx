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
        FROM folder
        JOIN projects ON folder.project_id = projects.project_id
        WHERE folder.parent_folder_id IS NULL and projects.name = ?
    `;

    const params: (string | number)[] = [project.replace(/%2B/g, ' ')];

    for (let i = 0; i < routes.length; i++) {
        sql = `
            FROM folder
            WHERE folder.parent_folder_id = (
            SELECT folder.folder_id
        `
        + sql + `AND folder.name = ?)`;
        params.push(routes[i].replace(/%2B/g, ' '));
    }

    sql = "SELECT folder.folder_id, folder.name" + sql;

    const [rows] = await connection.execute(sql, params);
    
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to retrieve folders" }, { status: 500 });
  }
}
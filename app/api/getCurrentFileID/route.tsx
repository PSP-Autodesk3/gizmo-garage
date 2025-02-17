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
        SELECT Projects.project_id
        FROM Projects
        WHERE Projects.name = ?
    `;

    const params: (string | number)[] = [project.replace(/%2B/g, ' ')];

    for (let i = 0; i < routes.length; i++) {
        sql = `
            SELECT Folder.folder_id
            FROM Folder
            ${i === 0 ? `WHERE Folder.project_id = (` : `WHERE Folder.parent_folder_id = (`}
            ${sql}
            ${i === 0 ? `) AND Folder.parent_folder_id IS NULL AND Folder.name = ?` : `) AND Folder.name = ?`}
        `
        params.push(routes[i].replace(/%2B/g, ' '));
    }

    console.log("Sql:", sql);
    console.log("Params:", params);

    const [rows] = await connection.execute(sql, params);
    
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to retrieve folders" }, { status: 500 });
  }
}
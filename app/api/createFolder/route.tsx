import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folderName, project, id, type } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const params: (string | number)[] = [folderName, project];
    if (type !== 1) params.push(id);
    params.push(project);

    params.push(folderName, project);
    if (type !== 1) params.push(id);

    console.log(params);

    await connection.execute(`
      INSERT INTO Folder (name, project_id, parent_folder_id)
      SELECT ?, (SELECT project_id FROM Projects WHERE name = ?), ${type === 1 ? `NULL` : `?`}
      FROM Projects
      WHERE name = ?
      AND NOT EXISTS (
        SELECT 1 FROM Folder 
        WHERE name = ? 
        AND project_id = (SELECT project_id FROM Projects WHERE name = ?) 
        AND parent_folder_id ${type === 1 ? `IS NULL` : `= ?`}
      );
      `, params
    );
    
    await connection.end();

    return NextResponse.json({ message: "Folder created successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
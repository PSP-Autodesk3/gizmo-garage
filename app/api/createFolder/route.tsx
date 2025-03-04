import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, projectid, folder_id, type } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log(name, ",", projectid, ",", folder_id, ",", type);

    const params: (string | number)[] = [name, projectid];
    if (type !== 1) params.push(folder_id);
    params.push(projectid);

    params.push(name, projectid);
    if (type !== 1) params.push(folder_id);

    await connection.execute(`
      INSERT INTO Folder (name, project_id, parent_folder_id)
      SELECT ?, ?, ${type === 1 ? `NULL` : `?`}
      FROM Projects
      WHERE name = (SELECT name FROM Projects WHERE Projects.project_id = ?)
      AND NOT EXISTS (
        SELECT 1 FROM Folder 
        WHERE name = ? 
        AND project_id = ?
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
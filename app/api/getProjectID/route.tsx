import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

interface Project {
    project_id: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project} = body;

    console.log("Recieved project:", project);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(`
        SELECT project_id
        FROM Projects
        WHERE name = ?
      `, [project]);
      
    const gatheredProject = rows as Project[];

    console.log("gathered Project:",gatheredProject);
    const projectId = gatheredProject[0].project_id;    
    console.log(projectId);
    await connection.end();

    return NextResponse.json(projectId);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to retrieve Project" }, { status: 500 });
  }
}
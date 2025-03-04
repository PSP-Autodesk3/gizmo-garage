import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { owner, project, email } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    await connection.execute(`
        DELETE Invite FROM Invite
        INNER JOIN Users ON Invite.user_id = Users.user_id
        INNER JOIN Projects ON Invite.project_id = Projects.project_id
        WHERE owner = ? AND Projects.name = ? AND Users.user_id = (SELECT user_id FROM Users WHERE email = ?)
        `, [owner, project, email]);
    
    await connection.end();

    return NextResponse.json({ message: "Successfully deleted invite" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import mysql, { ResultSetHeader } from "mysql2/promise";

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

        const [rows] = await connection.execute<ResultSetHeader>(`
            INSERT INTO Invite (user_id, project_id)
            SELECT user_id, project_id
            FROM Users, Projects
            WHERE Users.email = ? AND Projects.name = ?;
        `, [email, project]);

        await connection.end();

        return NextResponse.json({ rows });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
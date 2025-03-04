import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        console.log(email);

        const [rows] = await connection.execute(`
            SELECT Projects.name AS project, Projects.project_id, CONCAT(Author.fname, ' ', Author.lname) AS author, Author.user_id
            FROM Invite
            INNER JOIN Users ON Invite.user_id = Users.user_id
            INNER JOIN Projects ON Invite.project_id = Projects.project_id
            INNER JOIN Users AS Author ON Projects.owner = Author.user_id
            WHERE Users.email = ?
        `, [email]);

        await connection.end();

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to retrieve invites" }, { status: 500 });
    }
}
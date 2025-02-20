import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;
        const connection = await mysql.createConnection({
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_DATABASE,
            });
        const [rows] = await connection.execute(`
            SELECT *
            FROM Object
            INNER JOIN Users ON Object.author = Users.user_id
            WHERE object_id = ?;
        `, [id]);
        await connection.end();
        console.log(rows);
        return NextResponse.json(rows);
    } catch(err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Failed to retrieve folders" }, { status: 500 });
    }
}
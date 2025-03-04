import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get("name");
        const id = searchParams.get("id");

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const [rows] = await connection.execute(`
            UPDATE Projects
            SET name = ?
            WHERE project_id = ?
        `, [name, id]);
        await connection.end();

        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to update name" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const [rows] = await connection.execute(`
            SELECT object_id, Tag.tag
            FROM Object_Tag
            INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
            WHERE object_id IN ( SELECT object_id
            FROM Object)
    `) // May have to modify this in future so it fetches less tags for efficiency
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to check database status" }, { status: 500 });
    }
}
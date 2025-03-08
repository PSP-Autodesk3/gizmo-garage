import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const [rows] = await connection.execute(`
            SELECT object_id, tag.tag
            FROM Object_Tag
            INNER JOIN tag ON Object_Tag.tag_id = tag.tag_id
            WHERE object_id IN ( SELECT object_id
            FROM object)
    `) //may have to modify this in future so it fetches less tags for efficiency
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to check database status" }, { status: 500 });
    }
}
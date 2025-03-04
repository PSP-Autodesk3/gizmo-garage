import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {name, projectid, type, parent_folder_id} = body;
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const params: (string | number)[] = [name, projectid];
        if (type !== 1) params.push(parent_folder_id);

        const [rows] = await connection.execute(`
            SELECT COUNT(*) AS FolderExists
            FROM Folder
            WHERE name = ?
            AND project_id = ?
            AND parent_folder_id ${type === 1 ? `IS NULL` : `= ?`};
        `, params);
        await connection.end();
        return NextResponse.json(rows);
    } catch(err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Failed to check folder existence" }, { status: 500 });
    }
}
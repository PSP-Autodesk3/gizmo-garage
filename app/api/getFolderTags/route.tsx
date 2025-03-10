import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectid = searchParams.get("fileID");

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        console.log(projectid);
        const [rows] = await connection.execute(`
            SELECT *
            FROM Object_Tag
            INNER JOIN Object ON Object_Tag.object_id = Object.object_id
            INNER JOIN Folder ON Object.folder_id = Folder.folder_id
            INNER JOIN Tag ON Object_Tag.tag_id = Tag.tag_id
            WHERE Object.project_id = ?
        `, [projectid]);
        
    
        console.log("test",rows);
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to check database status" }, { status: 500 });
    }
}
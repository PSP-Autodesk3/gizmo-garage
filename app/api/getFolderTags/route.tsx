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
            FROM object_Tag
            INNER JOIN object ON object_Tag.object_id = object.object_id
            INNER JOIN folder ON object.folder_id = folder.folder_id
            INNER JOIN tag ON object_Tag.tag_id = tag.tag_id
            WHERE object.project_id = ?
        `, [projectid]);
        
    
        console.log("test",rows);
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to check database status" }, { status: 500 });
    }
}
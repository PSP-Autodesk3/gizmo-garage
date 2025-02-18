import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {itemName, email, project, type, id} = body;
        // Connect to DB
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Insert item into Object table
        const params: (string | number | null)[] = [itemName, email, project];
        if (type !== 1) {params.push(id);} else {params.push(null);}

        await connection.execute(`
            INSERT INTO Object
            (name, author, project_id, folder_id)
            VALUES (?, 
            (SELECT user_id FROM Users WHERE email = ?),
            (SELECT project_id FROM Projects WHERE name = ?), 
            ?)
        `, params);
        await connection.end();
        return NextResponse.json({ message: "Item created successfully" });
    } catch(err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}
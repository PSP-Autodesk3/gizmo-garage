import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { itemName, email, project, type, id, appliedTags } = body;
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
        if (type !== 1) { params.push(id); } else { params.push(null); }

        await connection.execute(`
            INSERT INTO Object
            (name, author, project_id, folder_id)
            VALUES (?, 
            (SELECT user_id FROM Users WHERE email = ?),
            (SELECT project_id FROM Projects WHERE name = ?), 
            ?)
        `, params);

        // Get the ID of the item just created
        const [latestId] = await connection.execute(`SELECT object_id
            FROM Object
            ORDER BY object_id DESC
            LIMIT 1
            WHERE Projects.owner = Users.user_id OR Editor.user_id IS NOT NULL;
`);

        await connection.execute(`
            INSERT INTO object_tag
            (object_id, tag_id)
            VALUES (, 
            ,
            (SELECT project_id FROM Projects WHERE name = ?), 
            ?)
        `, params);
        await connection.end();
        return NextResponse.json({ message: "Item created successfully" });
    } catch (err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
} 
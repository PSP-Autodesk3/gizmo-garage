import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: Request) {

    try {
        const body = await request.json();
        const { itemName, email, project, type, id, appliedTags} = body;
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
                VALUES  (?, 
                (SELECT user_id FROM Users WHERE email = ?),
                ?, 
                ?)
            `, params);

        // Get the ID of the item just created
        const [result] = await connection.execute(`SELECT LAST_INSERT_ID() AS id`); //found LAST_INSERT_ID() from the solution by Jaylen, Jul 12th 2015: https://stackoverflow.com/questions/31371079/retrieve-last-inserted-id-with-mysql - Jacob
        const latestId = (result as any)[0];

        console.log("project id:",project);

        // Insert tags into object_tag table
        for (const tag of appliedTags) {
            console.log("tagId:",tag.tag_id);
            console.log("latest:",latestId.id);
            await connection.execute(`
                INSERT INTO object_tag
                (object_id, tag_id)
                VALUES (?, ?)   
            `, [latestId.id, tag.tag_id]);
        }

        await connection.end();
        return NextResponse.json({ message: "Item created successfully" });

    }
    catch (err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
} 
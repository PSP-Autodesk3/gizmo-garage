import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req: Request) {
  try {
    console.log(" API Request Received");

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log(" Email received:", email);
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Connect to MySQL Database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log(" Connected to MySQL");

    
    const [rows]: any[] = await connection.execute(
      `SELECT fname AS firstName, lname AS lastName, email FROM users WHERE email = ?`,
      [email]
    );

    console.log(" Query result:", rows);

    await connection.end();

    if (!rows.length) {
      console.log(" No user found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    //  Generate username dynamically
    const userData = {
      ...rows[0],
      username: `${rows[0].firstName} ${rows[0].lastName}`.trim(),
    };

    console.log(" User found:", userData);
    return NextResponse.json(userData);
  } catch (error) {
    console.error(" Database error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

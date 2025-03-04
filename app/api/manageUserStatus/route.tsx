import { NextResponse } from "next/server";
import { adminAuth } from "@/app/firebase/admin-config";

export async function POST(request: Request) {
  try {
    const {uid, disabled} = await request.json(); // Get the uid and disabled status from the request body
    await adminAuth.updateUser(uid, {disabled}); // Update the user status
    return NextResponse.json({success: true}); 
  }catch(error){
    console.error('Error updating user status:', error);
    return NextResponse.json(
      {error: 'Failed to update user status'},
      {status: 500}
    );
  }
}
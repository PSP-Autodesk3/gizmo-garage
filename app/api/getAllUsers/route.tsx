import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth, UserRecord } from 'firebase-admin/auth';

// Define interface for the user data
interface UserData { 
  uid: string;
  email: string | undefined;
  disabled: boolean;
}

// Initialise Firebase Admin SDK, here is the firebase admin docs: https://firebase.google.com/docs/admin/setup
let adminAuth: Auth;

try {
  if (!getApps().length) { // Check if Firebase Admin SDK is already initialised
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    adminAuth = getAuth(app); // Get the new Auth instance
  } else {
    adminAuth = getAuth(); // Get the existing Auth instance
  }
} catch (error) { // Error handling
  console.error('Firebase Admin initialisation error:', error);
  throw error;
}

export async function GET() {
  try {
    const listUsersResult = await adminAuth.listUsers(); // Fetch all users
    const users: UserData[] = listUsersResult.users.map((userRecord: UserRecord) => ({ // Map the user data
      uid: userRecord.uid,
      email: userRecord.email,
      disabled: userRecord.disabled
    }));
    
    return NextResponse.json({ users }); // Return the user data
  } catch (error) {
    console.error('Error listing users:', error); 
    return NextResponse.json( // Return an error response
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
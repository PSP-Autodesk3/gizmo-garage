"use client";

import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';

export default function Settings() {
  const [user, loading] = useAuthState(auth);
  
  const handleSignOut = async (e: any) => {
    sessionStorage.setItem('token', '');
    signOut(auth);
  }

  if (loading) {
    return (
      <>
        <div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // Displays if the user is not logged into their account
  if (!user) {
    return (
      <>
        <div>
          <Link href="/login">Log in to your account</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col">
        <button onClick={() => handleSignOut(auth)}>Sign Out</button>
      </div>
    </>
  )
}

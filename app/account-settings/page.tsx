"use client";

import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { useState } from 'react';

// https://www.typescriptlang.org/docs/handbook/2/objects.html
interface Profile {
  firstName: string;
  lastName: string;
  emailId: string;
  userName: string;
  profileImages: { [key: string]: string }; // Fix TS7015 by replacing type "string" with a defined KV pair of a string. - AJ Ref: https://stackoverflow.com/a/40358512
}

export default function Settings() {
  const [user, loading] = useAuthState(auth);
  const [details, setDetails] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  
  const handleSignOut = async (e: any) => {
    sessionStorage.setItem('token', '');
    signOut(auth);
  }

  // Needs to be moved to an API, was added here for testing.
  const fetchData = async () => {
    const response = await fetch('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      }
    });
    setDetails(await response.json());
  }
  if (!details) {
    fetchData();
  }
  else {
    console.log(details.profileImages["sizeX80"]);
    console.log(details);
  }

  // Returns if loading
  if (loading) {
    return (
      <>
        <div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // Returns if the user is not logged into their account
  if (!user) {
    return (
      <>
        <div>
          <Link href="/login">Log in to your account</Link>
        </div>
      </>
    )
  }

  // Returns if the user is logged in
  return (
    <>
      <div className="flex flex-col">
        <button onClick={() => handleSignOut(auth)}>Sign Out</button>
        {details ? (
          <div>
            <img src={(details.profileImages["sizeX80"])}></img>
            <p id="name">Name: {details.firstName} {details.lastName}</p>
            <p id="email">Email: {details.emailId}</p>
            <p id="username">Username: {details.userName}</p>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
      <p>Gizmo Garage</p>
      <div id="firebase-settings">
        <form>
          <div className="py-2">
            <label htmlFor="email" className="text-xl">Email:</label>
            <input
              className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg"
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </form>
        <Link href="">Reset Password</Link>
      </div>
    </>
  )
}

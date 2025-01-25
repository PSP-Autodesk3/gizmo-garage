"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [codeChallenge, setCodeChallenge] = useState();
  const [user, loading] = useAuthState(auth);
  const [token, setToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Token", sessionStorage.getItem('token'));
    if (sessionStorage.getItem('token') != null && sessionStorage.getItem('token') != '') {
      setToken(true);
    }
    if (user) {
      const fetchCode = async () => {
        const response = await fetch("/api/auth");
        const data = await response.json();
        setCodeChallenge(data.code_challenge)
        sessionStorage.setItem('code_verifier', data.code_verifier);
      }
      fetchCode();
    }
  }, []);

  const handleSignOut = async (e: any) => {
    sessionStorage.setItem('token', '');
    signOut(auth);
  }

  const handleAccountSettings = async (e: any) => {
    console.log("Pushed");
    router.push("/account-settings");
    console.log("Pushed");
  }

  // Displays if the page is still loading
  if (loading) {
    // Can be used for lazy loading?
    return (
      <>
        <div>
          <p>Loading...</p>
        </div>
      </>
    )
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

  // Displays if the user doesn't have a valid token
  console.log(token);
  if (!token) {
    return (
      <>
        <div className="flex flex-col">
          <button onClick={() => handleSignOut(auth)}>Sign Out</button>
          <button onClick={() => handleAccountSettings(auth)}>Account Settings</button>
          <Link href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`}>Login through AutoDesk</Link>
        </div>
      </>
    )
  }

  // Displays in all information is valid
  return (
    <>
      <div className="flex flex-col">
        <button onClick={() => handleSignOut(auth)}>Sign Out</button>
        <button onClick={() => handleAccountSettings(auth)}>Account Settings</button>
        <p>Logged in and successfully validated</p>
      </div>
    </>
  )
}

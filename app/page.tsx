"use client";

// Useful imports (Only uncomment if using to avoid build errors)
//
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// For Code Challenge
import crypto from 'crypto';

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [codeChallenge, setCodeChallenge] = useState();
  const [user, loading] = useAuthState(auth);
  const [token, setToken] = useState(false);
  // const router = useRouter();

  useEffect(() => {
    console.log("Token", sessionStorage.getItem('token'));
    if (user) {
      async function GenerateCodeChallenge() {
        // https://aps.autodesk.com/en/docs/oauth/v2/tutorials/code-challenge/
        
        // Dependency: Node.js crypto module
        // https://nodejs.org/api/crypto.html#crypto_crypto
        function base64URLEncode(str: any) {
          return str.toString('base64')
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=/g, '');
        }
        var code_verifier = base64URLEncode(crypto.randomBytes(32));
        sessionStorage.setItem('code_verifier', code_verifier);
  
        // Dependency: Node.js crypto module
        // https://nodejs.org/api/crypto.html#crypto_crypto
        function sha256(buffer: any) {
          return crypto.createHash('sha256').update(buffer).digest();
        }
        setCodeChallenge(base64URLEncode(sha256(code_verifier)));
  
          // Logic needs updating to ensure validity of token
        if (sessionStorage.getItem('token')) {
          setToken(true);
        }
      }
      GenerateCodeChallenge();
    }
  }, []);

  // Displays if the page is still loading
  if (loading) {
    // Can be used for lazy loading?
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }
  
  // Displays if the user is not logged into their account
  if (!user) {
    return (
      <div>
        <Link href="/login">Log in to your account</Link>
      </div>
    )
  }

  // Displays if the user doesn't have a valid token
  if (!token) {
    return (
      <div className="flex flex-col">
        <button onClick={() => signOut(auth)}>Sign Out</button>
        <Link href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`}>Login through AutoDesk</Link>
      </div>
    )
  }

  // Displays in all information is valid
  return (
    <div>
      <button onClick={() => signOut(auth)}>Sign Out</button>
      <p>Logged in and successfully validated</p>
    </div>
  )
}

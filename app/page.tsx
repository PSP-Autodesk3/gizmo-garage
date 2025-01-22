"use client";

// Useful imports (Only uncomment if using to avoid build errors)
//
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import crypto from 'crypto';

export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [loading, setLoading] = useState(true);
  const [codeChallenge, setCodeChallenge] = useState();
  // const router = useRouter();

  useEffect(() => {
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

      setLoading(false);
    }
    GenerateCodeChallenge();
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

  // Displays once page has loaded
  return (
    <div>
        <a href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`}>Login through AutoDesk</a>
    </div>
  );
}

"use client";

// Useful imports (Only uncomment if using to avoid build errors)
//
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const client_id = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [loading, setLoading] = useState(true);
  // const router = useRouter();

  useEffect(() => {
    setLoading(false);
  });

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
        <a href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${client_id}&redirect_uri=http%3A%2F%2Flocalhost%3A3000&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=fePr9SDGJIToHximLHTRokkzkfzZksznrDIx9bexsto&code_challenge_method=S256`}>Login through AutoDesk</a>
    </div>
  );
}

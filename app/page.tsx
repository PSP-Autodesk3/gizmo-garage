"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

//import filter component
import Filters from './Filter';


export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [codeChallenge, setCodeChallenge] = useState();
  const [user, loading] = useAuthState(auth);
  const [token, setToken] = useState(false);
  const router = useRouter();
  const admin = useState(true);

  useEffect(() => {
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
    console.log("Fetching data...");
    const fetchData = async () => {
      let data = await fetch("https://developer.api.autodesk.com/project/v1/hubs", {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      console.log("Data:", data.json());

      data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: JSON.stringify({ bucketKey: "myBucket", policyKey: "persistent" })
      })
    }
    fetchData();
  }, []);

    // Displays if all information is valid
    const handleSignOut = async (e: any) => {
      sessionStorage.setItem('token', '');
      signOut(auth);
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
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
            <div className="flex flex-col items-center space-y-6">
                <h1 className="text-4xl text-center font-semibold">
                    Gizmo Garage
                </h1>
                <Link href="/login" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                    Sign in to your account
                </Link>
            </div>
        </div>
      </>
    )
  }


  if (!token) {
    return (
      <div className='h-screen content-center'>
          <div className="flex justify-center content-center">
            <div className="flex flex-col content-center text-white p-6 rounded-lg bg-slate-800 h-[40%] max-w-[40%]">
              <h1 className="text-3xl text-center p-2 font-semibold">Authenticate to continue</h1>
              <Link href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 text-center mt-2 self-center">Login through AutoDesk</Link>
              <button onClick={() => handleSignOut(auth)} className="px-6 self-center py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 mt-2">Sign Out</button>
            </div>
        </div>
      </div>
    )
  }

  // Displays if all information is valid
  return (
    <>
    <div className="flex">
      <div>
        <Filters/>
      </div>
      <div className='m-auto'>
        <div id="data" className=' mt-0 flex flex-col justify-center'>
          <h1 className='p-10 text-4xl text-white transition-colors duration-300 hover:text-gray-400 pb-10'>Projects</h1>
          <div id="folders">
            <div className="bg-slate-900 p-4 m-auto rounded-lg shadow-lg mt-16 flex flex-row justify-between">
              <div className='p-2 pr-10'>
                <p>Name: </p>
                <p>Version: </p>
                <p>Date: </p>
              </div>
              <div className='content-center'>
                <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">View</button>
              </div>
            </div>
          </div>
          <div id="files">

          </div>
        </div>
      </div>
    </div>
     
    </>
  )
}

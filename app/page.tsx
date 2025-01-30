"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

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
  const admin = useState(true);
  const [query, updateQuery] = useState('');
  const [tagQuery, updateTagQuery] = useState('');
  const [values, setValues] = useState([20, 80]);

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

  // Displays if the user doesn't have a valid token
  if (!token) {
    return (
      <div className="float-right my-2 mx-4 space-x-4">
        <Link href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Login through AutoDesk</Link>
        <button onClick={() => handleSignOut(auth)} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Sign Out</button>
          <button onClick={() => handleAccountSettings(auth)}>Account Settings</button>
      </div>
    )
  }

  // Displays if all information is valid
  return (
    <>
      <div id="side-bar">
        <img src="source" alt="Logo"/>
        <p>Gizmo Garage</p>
        <div id="filters">
          <div id="file-size-filter">
            {/* https://www.geeksforgeeks.org/how-to-add-slider-in-next-js/ - Rob*/}
            <Range
              step={0.1}
              min={0}
              max={100}
              values={values}
              onChange={(newValues) => setValues(newValues)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                      ...props.style,
                      height: '6px',
                      width: '50%',
                      backgroundColor: '#ccc'
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '42px',
                    width: '42px',
                    backgroundColor: '#999'
                  }}
                />
              )}
              onFinalChange={() => console.log(values)}
            />
          </div>
          <div id="tags">
            <label htmlFor="tag-search">Tags</label>
            <input
              type="text"
              placeholder="Search"
              name="tag-search"
              value={tagQuery}
              onChange={(e) => updateTagQuery(e.target.value)}
            />
            <div id="applied-tags">

            </div>
          </div>
          <div id="search">
            <label htmlFor="search=bar">Search</label>
            <input
              type="text"
              placeholder="Search"
              name="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
            />
          </div>
          <button>Submit</button>
        </div>
        <div id="options">
          {admin ? (
            <>
              <button onClick={() => router.push("/users")}>Admin Settings</button>
            </>
          ) : (
            <></>
          )}
          <button onClick={() => handleAccountSettings(auth)}>Account Settings</button>
          <button onClick={() => handleSignOut(auth)}>Sign Out</button>
        </div>
      </div>
      <div id="data">
        <div id="folders">

        </div>
        <div id="files">

        </div>
      </div>
    </>
  )
}

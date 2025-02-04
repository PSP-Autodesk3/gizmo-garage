"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true);
  const [query, updateQuery] = useState('');
  const [tagQuery, updateTagQuery] = useState('');
  const [values, setValues] = useState([20, 80]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // This works, but is just testing. These should be reworked into the actual application.

    // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
    if (sessionStorage.getItem('token') != '') {
      // Fetches data, needs moving to apis and is temporary for testing
      const fetchData = async () => {
        // POSTs bucket
        let data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "POST",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" },
          body: JSON.stringify({ "bucketKey": "testbucketno1", "policyKey": "persistent" })
        })
        let json = await data.json();
        console.log("Bucket insert:", json);
        
        // GETs all buckets
        data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "GET",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" }
        })
        json = await data.json();
        console.log("Bucket response:", json);
      }
      fetchData();
    }


  }, []);

  const getError = async () => {
    let errorSession = sessionStorage.getItem("errorMessage");
    if (errorSession) {
      setErrorMessage(errorSession);
      sessionStorage.removeItem("errorMessage");
    }

    errorSession = sessionStorage.getItem("errorDescription");
    if (errorSession) {
      console.log("Error Description:", errorSession);
      sessionStorage.removeItem("errorDescription");
    }
  }
  if (!errorMessage) getError();

  // Directs to account settings page
  const handleAccountSettings = async (e: typeof auth) => {
    router.push("/account-settings");
  }

  // Keeps client id out of the dom
  const handleAuthenticateRequest = async () => {
    router.push(`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=${encodeURIComponent("data:read bucket:create bucket:read")}`);
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
  if (!sessionStorage.getItem('token')) {
    return (
      <div className="float-right my-2 mx-4 space-x-4">
        <button onClick={() => handleAuthenticateRequest()} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Authenticate wiith AutoDesk
        </button>
        <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Sign Out
        </Link>
        {errorMessage && (
          <div id="error-message">
            <p>{errorMessage}</p>
            <p>Open the console to view more details</p>
          </div>
        )}
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
          <Link href="/signout">Sign Out</Link>
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

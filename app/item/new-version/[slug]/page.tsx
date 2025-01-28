"use client";

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [user, loading] = useAuthState(auth);

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

  // Displays if all information is valid
  return (
    <>
        <p>Item Name</p>
        <p>New Version 25.1.1</p>
        <div id="objects">

        </div>
        <div id="options">
          <button>Upload New Object</button>
          <button>Submit Version</button>
        </div>
    </>
  )
}

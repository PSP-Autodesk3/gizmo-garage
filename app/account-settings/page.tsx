"use client";

import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

// https://www.typescriptlang.org/docs/handbook/2/objects.html
interface Profile {
  firstName: string;
  lastName: string;
  emailId: string;
  userName: string;
  profileImages: { [key: string]: string }; // Fix TS7015 by replacing type "string" with a defined KV pair of a string. - Adam Ref: https://stackoverflow.com/a/40358512
}

export default function Settings() {
  const [user, loading] = useAuthState(auth);
  const [details, setDetails] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  
  const handleSignOut = async (e: any) => {
    sessionStorage.setItem('token', '');
    signOut(auth);
  }

  // Reset password
  function resetPassword(email: string) {
      sendPasswordResetEmail(auth, email) // Ref: https://stackoverflow.com/a/71025861 - Adam
      .then(()=> {
          const popupAlert = document.querySelector('.popup')
          popupAlert?.classList.add('show');
          popupAlert?.classList.remove('hidden');
          setTimeout(() => {
              popupAlert?.classList.remove('show');
              popupAlert?.classList.add('hidden');
          }, 3000); // Hide after 3 seconds
      })
      .catch((err) => {
          alert(err.message);
      });
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
    <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
            <h1 className="text-xl font-bold">Password Reset</h1>
            <p className="mx-2">We have sent an email to {email}.</p>
        </div>
        <div className="bg-slate-900 w-[65%] rounded-lg p-4 m-auto mt-16">
        {details ? (
          <div>
            <img src={(details.profileImages["sizeX80"])} className="rounded-full m-auto"></img>
            <div className="lg:grid lg:grid-cols-3 lg:align-center md:text-center gap-8 text-xl my-8">
                <p id="name"><b>Name:</b> {details.firstName} {details.lastName}</p>
                <p id="email"><b>Email:</b> {details.emailId}</p>
                <p id="username"><b>Username:</b> {details.userName}</p>
            </div>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
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
        <div className="md:flex">
        <button onClick={() => handleSignOut(auth)} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Sign Out</button>
        <button 
            type="button"
            className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500 50" 
            onClick={() => resetPassword(email)}
            >
            Reset Password
        </button>
        </div>
      </div>
        </div>
    </>
  )
}

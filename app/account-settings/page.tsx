"use client";

import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';


export default function Settings() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');

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
      <div className="flex flex-col">
        <Link href="/signout">Sign Out</Link>
        {/*
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
        */}
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
        <button 
            type="button"
            className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500 50" 
            onClick={() => resetPassword(email)}
            >
            Reset Password
        </button>
      </div>
    </>
  )
}

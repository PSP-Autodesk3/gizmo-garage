"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import Link from 'next/link';
import { useState } from 'react';

function Home() {
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

export default withAuth(Home);
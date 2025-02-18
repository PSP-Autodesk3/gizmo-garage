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

  // Replace with actual user data from Firebase/Auth context
  const userData = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe123",
    email: "johndoe@example.com"
  };

  // Reset password function
  function resetPassword(email: string) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        const popupAlert = document.querySelector('.popup');
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
      
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
        <h1 className="text-xl font-bold">Password Reset</h1>
        <p className="mx-2">We have sent an email to {email}.</p>
      </div>

      
      <div className="p-4 flex justify-between items-center">
        <Link href="/" className="text-blue-500 hover:underline text-lg">← Home</Link>
        <Link className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500 50" href="/signout">
          Sign Out
        </Link>
      </div>

    
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Account Settings</h1>
        <p className="font-bold text-2xl mb-4">Autodesk</p>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white mb-6">
          <p className="text-lg mb-2"><span className="font-bold">First Name:</span> {userData.firstName}</p>
          <p className="text-lg mb-2"><span className="font-bold">Last Name:</span> {userData.lastName}</p>
          <p className="text-lg mb-2"><span className="font-bold">Username:</span> {userData.username}</p>
          <p className="text-lg"><span className="font-bold">Email:</span> {userData.email}</p>
        </div>

        
        <p className="font-bold text-2xl mb-4">Gizmo Garage</p>

        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
          <form className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-lg">Email</label>
              <input
                className="w-full text-white bg-gray-700 p-2 rounded-lg"
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500 50"
            > Save</button>
          </form>
          <p className="text-indigo-500 hover:underline cursor-pointer mt-3"
            onClick={() => resetPassword(email)}
          > Reset Password</p>
        </div>
      </div>
    </>
  )
}

export default withAuth(Home);

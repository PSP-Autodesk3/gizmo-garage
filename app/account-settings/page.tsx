"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Components
import BackBtnBar from '@/app/shared/components/backBtnBar';

// Interfaces
import { User } from '@/app/shared/interfaces/user';

// Other
import { useEffect, useState } from 'react';

function Home() {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState<User>();

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

  useEffect(() => {
    const getDetails = async () => {
      const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/users/details`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      })
      const response = await query.json();
      setDetails(response[0]);
    }
    if (user) {
      getDetails();
    }
  }, [user])

  return (
    <>
      <BackBtnBar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Account Settings</h1>
        <p className="font-bold text-2xl mb-4">Gizmo Garage</p>
        {details && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white mb-6">
            <p className="text-lg mb-2"><span className="font-bold">First Name:</span> {details.fname}</p>
            <p className="text-lg mb-2"><span className="font-bold">Last Name:</span> {details.lname}</p>
            <p className="text-lg"><span className="font-bold">Email:</span> {details.email}</p>
          </div>
        )}

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

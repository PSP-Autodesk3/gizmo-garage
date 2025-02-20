"use client";

import { auth } from "@/app/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import BackBtnBar from "../backBtnBar";
import withAuth from "@/app/lib/withAuth";
import React, { useState, useEffect } from "react";

// Define UserData type
interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

function AccountSettings() {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get user's email from Firebase Auth
  useEffect(() => {
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  // ✅ Fetch user data from API
  useEffect(() => {
    async function fetchUserData() {
      if (!email) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/getUserDetails?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data: UserData = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [email]);

  // ✅ Reset Password Function
  function resetPassword(email: string) {
    if (!email) return alert("Please enter a valid email.");
    sendPasswordResetEmail(auth, email)
      .then(() => alert("Password reset email sent!"))
      .catch((err) => alert(err.message));
  }

  
  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <>
      <BackBtnBar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Account Settings</h1>
        <p className="font-bold text-2xl mb-4">User Details</p>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white mb-6">
          <p className="text-lg mb-2"><span className="font-bold">First Name:</span> {userData?.firstName}</p>
          <p className="text-lg mb-2"><span className="font-bold">Last Name:</span> {userData?.lastName}</p>
          <p className="text-lg mb-2"><span className="font-bold">Username:</span> {userData?.username}</p>
          <p className="text-lg"><span className="font-bold">Email:</span> {userData?.email}</p>
        </div>

        <p className="font-bold text-2xl mb-4">Update Email</p>
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
              type="button"
              className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500"
            >
              Save
            </button>
          </form>
          <p className="text-indigo-500 hover:underline cursor-pointer mt-3" onClick={() => resetPassword(email)}>
            Reset Password
          </p>
        </div>
      </div>
    </>
  );
}

export default withAuth(AccountSettings);

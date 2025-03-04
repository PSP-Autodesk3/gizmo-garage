"use client";

import { auth } from "@/app/firebase/config";
import { sendPasswordResetEmail, updateEmail, sendEmailVerification, User } from "firebase/auth";
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
  const [newEmail, setNewEmail] = useState(""); // State for new email input
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // Track if the email is verified

  // Get user's email from Firebase Auth
  useEffect(() => {
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
      setEmailVerified(auth.currentUser.emailVerified); // Check if email is verified
    }
  }, []);

  // Fetch user data from API
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

  // Handle email update
  const handleEmailUpdate = async () => {
    if (!newEmail) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("No user found. Please log in.");
        return;
      }

      // Send email verification to the new email address
      await sendEmailVerification(user); // Send verification to the new email
      setSuccess("Verification email sent to your new email address. Please verify it before updating.");
      setError(""); // Reset any previous error

      // You should not call updateEmail until the email is verified
      setEmail(newEmail); // Update local state with the new email
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      setError(err.message || "Failed to send verification email. Please try again.");
    }
  };

  // Function to check if the email is verified
  const checkEmailVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload(); // Ensure the current user info is up to date
      return user.emailVerified;
    }
    return false;
  };

  // Function to update email in Firebase
  const updateEmailInFirebase = async (newEmail: string) => {
    const user = auth.currentUser;
    if (user && await checkEmailVerification()) {
      try {
        await updateEmail(user, newEmail); // Update email in Firebase
        setSuccess("Email updated successfully!");
        setEmail(newEmail); // Update local state with the new email
      } catch (error) {
        console.error("Error updating email in Firebase:", error);
        setError("Failed to update email in Firebase.");
      }
    } else {
      setError("Please verify your new email before updating.");
    }
  };

  // Reset Password Function
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
          {success && <p className="text-green-500 mb-3">{success}</p>}
          {error && <p className="text-red-500 mb-3">{error}</p>}
          <form className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-lg">Email</label>
              <input
                className="w-full text-white bg-gray-700 p-2 rounded-lg"
                type="email"
                placeholder="New Email"
                name="email"
                value={newEmail} // Use newEmail for updating
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500"
              onClick={handleEmailUpdate} // Call the function to update email
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

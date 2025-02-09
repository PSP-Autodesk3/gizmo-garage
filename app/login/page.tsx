"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const handleSignIn = async (e: any) => {
    e.preventDefault();

    try {
        const res = await signInWithEmailAndPassword(email, password);
        setEmail('');
        setPassword('');

        if (res && res.user) {
          router.push('/');
        } else {
          setError('Invalid email or password');
        }
    } catch (e) {
        console.error(e);
        setError('Invalid email or password');
    }
  }

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
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
        <h1 className="text-3xl text-center p-2 font-semibold">Login</h1>
        <form onSubmit={(handleSignIn)}>
            <div className="py-2">
              <label className="text-xl" htmlFor="email">Email:</label>
              <input
                  className="text-white w-full p-2 my-2 rounded-lg bg-slate-800"
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </div>
            <div className="py-2">
              <label htmlFor="password" className="text-xl">Password:</label>
              <input
                  className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            <button type="submit" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Sign in</button>
            <button 
                type="button"
                className="px-6 py-3 text-lg font-medium bg-indigo-600 mx-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500 50" 
                onClick={() => resetPassword(email)}
            >
                Reset Password
            </button>
            {error && <p>{error}</p>}
        </form>
        <div className="mt-4">
            <Link href="/register">Not a Member?</Link>
        </div>
      </div>
    </>
  );
}

export default withAuth(Home);
"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        const res = await signInWithEmailAndPassword(email, password);
        setEmail('');
        setPassword('');

        if (res && res.user) {
          router.push('/authenticate');
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
      <div className="bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] m-auto rounded-lg mt-16 border border-slate-700/50">
        <h1 className="text-3xl text-center p-2 font-semibold text-slate-900 dark:text-slate-200">Login</h1>
        <form onSubmit={(handleSignIn)}>
            <div className="py-2">
              <label className="text-xl text-slate-900 dark:text-slate-200 font-semibold" htmlFor="email">Email:</label>
              <input
                  className="text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50"
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </div>
            <div className="py-2">
              <label htmlFor="password" className="text-xl text-slate-900 dark:text-slate-200 font-semibold">Password:</label>
              <input
                className={`text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 
                    border border-slate-700/50 ${error ? 'border-2 border-red-500' : ''}`}
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
                <p className="text-red-500 text-sm mt-1 font-semibold text-center mb-4">{error}</p>
            )}
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                  Sign in
              </button>
              <button 
                  type="button"
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" 
                  onClick={() => resetPassword(email)}
              >
                  Reset Password
              </button>
              <div className="mt-4 text-slate-900 dark:text-slate-200">
                  <Link href="/register" className='text-indigo-700 dark:text-white hover:underline cursor-pointer font-semibold mt-4'>Not a Member?</Link>
              </div>
            </div>
        </form>
      </div>
    </>
  );
}

export default withAuth(Home);
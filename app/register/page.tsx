"use client";

import { useEffect, useState } from 'react';
import { useCreateUserWithEmailAndPassword  } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  useEffect(() => {

    setLoading(false);
  }, []);

  const handleSignUp = async (e: any) => {
    e.preventDefault();

    try {
        if (password1 === password2) {
            createUserWithEmailAndPassword(email, password1);
            // Needs a check added to see if this is successfully created.
            router.push("/login");
        }
        else setError("Passwords do not match");
    } catch (e) {
        console.error(e);
        setError('Error registering account');
    }
  }

  if (loading) {
    return (
        <>
            <div>
                <p>Loading...</p>
            </div>
        </>
    )
  }

  return (
    <>
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
            <h1 className="text-3xl text-center p-2 font-semibold">Login</h1>
            <form onSubmit={(handleSignUp)}>
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
                    <label htmlFor="password1" className="text-xl">Password:</label>
                    <input
                        className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg"
                        type="password"
                        placeholder="Password"
                        name="password1"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        required
                    />
                </div>
                <div className="py-2">
                    <label htmlFor="password2" className="text-xl">Confirm Password:</label>
                    <input
                        className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg"
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Sign in</button>
                {error && <p>{error}</p>}
            </form>
            <Link href="/login">Already a Member?</Link>
        </div>
    </>
  );
}

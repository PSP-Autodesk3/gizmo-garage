"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useCreateUserWithEmailAndPassword  } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Home() {
  const [email, setEmail] = useState('');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

    useEffect(() => {
        if (error) {
        const timer = setTimeout(() => {
            setError('');
        }, 3000);
    
        return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if ((password1 === password2)) {
                if (password1.length >= 6) {
                    if (password1 && password1.trim() != "" && email && email.trim() != "" && fName && fName.trim() != "" && lName && lName.trim() != "") {
                        const result = await createUserWithEmailAndPassword(email, password1);
                        
                        if (result?.user) {
                            const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/users/create`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, fName, lName }),
                            })
                            if (response.status == 200) {
                                router.push("/authenticate");
                            }
                        }
                        else setError("Account creation failed. Please try again.");
                    } 
                    else setError("Missing credentials.");
                }
                else setError("Password must be at least 6 characters in length");
            }
            else setError("Passwords do not match");
        } catch (e) {
            console.error(e);
            setError('Error registering account');
        }
    }

  return (
    <>
        <div className="bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] text-slate-900 dark:text-gray-300 mb-2 border border-slate-700/50 m-auto rounded-lg mt-16">
            <h1 className="text-3xl text-center p-2 font-semibold">Sign up</h1>
            <form onSubmit={(handleSignUp)}>
                <div className="py-2">
                    <label className="text-xl" htmlFor="email">Email:</label>
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
                    <label className="text-xl" htmlFor="fName">First Name:</label>
                    <input
                        className="text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50"
                        type="text"
                        placeholder="First Name"
                        name="fName"
                        value={fName}
                        onChange={(e) => setFName(e.target.value)}
                        required
                    />
                </div>
                <div className="py-2">
                    <label className="text-xl" htmlFor="lName">Last Name:</label>
                    <input
                        className="text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50"
                        type="text"
                        placeholder="Last Name"
                        name="lName"
                        value={lName}
                        onChange={(e) => setLName(e.target.value)}
                        required
                    />
                </div>
                <div className="py-2">
                    <label htmlFor="password1" className="text-xl">Password:</label>
                    <input
                        className={`text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 
                            border border-slate-700/50 ${error?.includes('Password') ? 'border-2 border-red-500' : ''}`}
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
                        className={`text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 
                            border border-slate-700/50 ${error?.includes('Password') ? 'border-2 border-red-500' : ''}`}
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-1 font-semibold text-center mb-4">{error}</p>
                )}
                <div className='flex flex-row justify-between items-center px-2 font-semibold text-l'>
                    <button type="submit" className="text-white px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                        Sign up
                    </button>
                    <Link href="/login" className='text-indigo-700 dark:text-white hover:underline cursor-pointer'>
                        Already a Member?
                    </Link>
                </div>
            </form>
        </div>
    </>
  );
}

export default withAuth(Home);
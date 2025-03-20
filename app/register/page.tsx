"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useCreateUserWithEmailAndPassword  } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState } from 'react';
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
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
            <h1 className="text-3xl text-center p-2 font-semibold">Sign up</h1>
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
                    <label className="text-xl" htmlFor="fName">First Name:</label>
                    <input
                        className="text-white w-full p-2 my-2 rounded-lg bg-slate-800"
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
                        className="text-white w-full p-2 my-2 rounded-lg bg-slate-800"
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
                <button type="submit" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">Sign up</button>
                {error && <p>{error}</p>}
            </form>
            <Link href="/login">Already a Member?</Link>
        </div>
    </>
  );
}

export default withAuth(Home);
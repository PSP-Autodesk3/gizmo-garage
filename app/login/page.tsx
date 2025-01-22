"use client";

import { useEffect, useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { setegid } from 'process';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  useEffect(() => {

    setLoading(false);
  }, []);

  const handleSignIn = async (e: any) => {
    e.preventDefault();

    try {
        const res = await signInWithEmailAndPassword(email, password);
        setEmail('');
        setPassword('');

        if (res && res.user) {
          router.push('/');
        }
    } catch (e) {
        console.error(e);
        setError('Invalid email or password');
    }
  }

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
        <p>Login</p>
        <form onSubmit={(handleSignIn)}>
            <label htmlFor="email">Email</label>
            <input
                className="text-black"
                type="email"
                placeholder="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label htmlFor="password">Password</label>
            <input
                className="text-black"
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Sign in</button>
            {error && <p>{error}</p>}
        </form>
    </div>
  );
}

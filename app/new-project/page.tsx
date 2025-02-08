"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");

    const newProjectSubmitted = async (e: any) => {
        e.preventDefault()
        if (name != null && name.trim() != "")
        console.log(name);
    }

    if (!user || !sessionStorage.getItem('token')) {
        router.push("/");
    }

    return (
        <>
            <form onSubmit={(e) => newProjectSubmitted(e)}>
                <label htmlFor="name">Project Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button>Submit</button>
            </form>
        </>
    )
}
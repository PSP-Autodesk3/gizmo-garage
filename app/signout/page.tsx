"use client"

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const handleSignOut = async () => {
            sessionStorage.setItem("token", "");
            await signOut(auth);
            router.push("/");
        };

        handleSignOut();
    }, [router]);

    return (
        <>
            <p>Signing out...</p>
        </>
    )
}
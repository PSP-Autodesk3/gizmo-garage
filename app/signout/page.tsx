"use client"

// Firebase
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

function Home() {
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

export default withAuth(Home);
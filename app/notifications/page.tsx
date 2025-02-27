"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react'
import BackBtnBar from '../backBtnBar';

interface Invite {
    project: string;
    author: string;
}

function Home() {
    const [user, loadingAuth] = useAuthState(auth);
    const [invites, setInvites] = useState<Invite[]>([]);

    const fetchInvites = async () => {
        const invites = await fetch("/api/getUserInvites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user?.email })
        });

        setInvites(await invites.json());
    }

    useEffect(() => {
        if (!loadingAuth) {
            fetchInvites();
        }
    }, [loadingAuth]);

    return (
        <>
            <BackBtnBar />
            <h1 className="text-3xl font-bold text-slate-200 text-center mt-8">
                Notifications
            </h1>
            {Array.isArray(invites) && invites.length > 0 ? (
                invites.map((invite) => (
                    <div key={invite.project + invite.author}>
                        <p>{invite.project}</p>
                        <p>{invite.author}</p>
                        <button>
                            Accept
                        </button>
                        <button>
                            Decline
                        </button>
                    </div>
                ))) : (
                <p>No invites</p>
            )}
        </>
    )
}

export default withAuth(Home);
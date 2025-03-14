"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react'

// Components
import BackBtnBar from '@/app/shared/components/backBtnBar';

// Interfaces
import { Invite } from '@/app/shared/interfaces/invite';

function Home() {
    const [user, loadingAuth] = useAuthState(auth);
    const [invites, setInvites] = useState<Invite[]>([]);

    const fetchInvites = async () => {
        const invites = await fetch(`http://${process.env.SERVER_HOST}:3001/invites/get`, {
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

    const acceptInvite = async (invite: Invite) => {
        declineInvite(invite);

        await fetch(`http://${process.env.SERVER_HOST}:3001/editors/add`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user?.email, project: invite.project_id })
        })
    }

    const declineInvite = async (invite: Invite) => {
        console.log("Invite:", invite);
        await fetch(`http://${process.env.SERVER_HOST}:3001/invites/remove`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: invite.user_id, project: invite.project, email: user?.email }),
        });

        fetchInvites();
    }

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
                        <button
                            onClick={() => acceptInvite(invite)}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => declineInvite(invite)}
                        >
                            Decline
                        </button>
                    </div>
                ))) : (
                <p>No pending invites...</p>
            )}
        </>
    )
}

export default withAuth(Home);
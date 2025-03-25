"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect, useCallback } from 'react'

// Components
import BackBtnBar from '@/app/shared/components/backBtnBar';

// Interfaces
import { Invite } from '@/app/shared/interfaces/invite';

function Home() {
    const [user, loadingAuth] = useAuthState(auth);
    const [invites, setInvites] = useState<Invite[]>([]);

    const fetchInvites = useCallback(async () => {
        try {
            const invites = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/invites/get`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user?.email })
            });

            setInvites(await invites.json());
        } catch (error) {
            console.error("Error fetching invites:", error);
        }
    }, [user?.email])

    useEffect(() => {
        if (!loadingAuth) {
            fetchInvites();
        }
    }, [loadingAuth, fetchInvites]);

    const acceptInvite = async (invite: Invite) => {
        declineInvite(invite);

        await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/editors/add`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user?.email, project: invite.project_id })
        })
    }

    const declineInvite = async (invite: Invite) => {
        console.log("Invite:", invite);
        await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/invites/remove`, {
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

            <div className='bg-slate-900 p-4 mx-8 my-4 rounded-lg'>
                {Array.isArray(invites) && invites.length > 0 ? (
                    invites.map((invite) => (
                        <div className='flex justify-between items-center mb-4' key={invite.project + invite.author}>
                            <div>
                                <p className="text-4xl pb-5 font-bold">{invite.project}</p>
                                <p>Author: <span className='rounded-full m-2 p-2 bg-blue-600'>{invite.author}</span></p>
                            </div>
                            <div className='content-center flex'>
                                <button
                                    className="px-6 bg-green-700 py-3 mr-4 text-lg font-medium rounded-lg transition-all duration-300 hover:bg-green-500 hover:scale-105 shadow-lg hover:shadow-green-500/50"
                                    onClick={() => acceptInvite(invite)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-6 py-3 bg-red-700 mr-4 text-lg font-medium rounded-lg transition-all duration-300 hover:bg-red-500 hover:scale-105 shadow-lg hover:shadow-red-500/50"
                                    onClick={() => declineInvite(invite)}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))) : (
                    <p className='flex justify-center text-3xl text-gray-500'>No pending invites...</p>
                )}
            </div>


        </>
    )
}

export default withAuth(Home);
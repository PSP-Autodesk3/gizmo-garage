"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");

    const newProjectSubmitted = async (e: any) => {
        e.preventDefault()
        if (name != null && name.trim() != "") {
            const exists = await fetch(`/api/getProjectExists?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            let response = await exists.json();
            if (response[0]?.ProjectExists == 0 && user?.email) {
                const getUser = await fetch(`/api/getUserDetails?email=${encodeURIComponent(user?.email)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
                response = await getUser.json();
                console.log("Dbug Reponse:", response)
            }
            // Check for valid response
            if (Array.isArray(response) && response.length > 0 && response[0].user_id) {
                const id = response[0].user_id;
                const createProject = await fetch(`/api/createProject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, id }),
                })
                response = await createProject.json();
                if (response.error == null) {
                    router.push("/");
                } else {
                    console.log("Error:", response.error);
                }
            } else {
                console.log("Failed to find user in database.")
            }
        } else {
            console.log("Error: Already exists.")
        }
    }

    useEffect(() => {
        if (!user || !sessionStorage.getItem('token')) {
            router.push("/");
        }
    }, [user])

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
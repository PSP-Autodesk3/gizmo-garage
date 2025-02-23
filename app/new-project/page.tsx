"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import BackBtnBar from '@/app/backBtnBar';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import Permissions from '../projectPermissions';

export default function Home() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");
    const [doesExist, setDoesExist] = useState(0);
    const [editors, setEditors] = useState<string[]>([]);

    const newProjectSubmitted = async (e: any) => {
        e.preventDefault()
        if (name != null && name.trim() != "") {
            const exists = await fetch(`/api/getProjectExists?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            let response = await exists.json();

            if (response[0]?.ProjectExists == 1) {
                setDoesExist(1);
                setTimeout(() => {
                    setDoesExist(0);
                }, 3000);
            }
            if (response[0]?.ProjectExists == 0 && user?.email) {
                const getUser = await fetch(`/api/getUserDetails?email=${encodeURIComponent(user?.email)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
                response = await getUser.json();

                if (response[0].user_id) {
                    const id = response[0].user_id;
                    const createProject = await fetch(`/api/createProject`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, id }),
                    })
                    response = await createProject.json();

                    if (response.error == null) {
                        console.log("Emails:", editors);
                        editors.forEach(async (editor) => {
                            console.log("Processing Email:", editor);
                            const inviteUser = await fetch(`/api/inviteUser`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: editor, project: name }),
                            })

                            console.log("Email:", await inviteUser.json());
                        })

                        /*router.push("/");*/
                    } else {
                        console.log("Error:", response.error);
                    }
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
        <div>
            <BackBtnBar />
            <div className="bg-slate-900 py-4 px-8 rounded-lg flex flex-row w-[50%] m-auto my-16 justify-center items-center">
                <form onSubmit={(e) => newProjectSubmitted(e)}>
                    <label htmlFor="name" className="text-2xl my-8">Project Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-lg bg-slate-800 p-2 m-8 text-2xl"
                    />
                    <button
                        className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Create
                    </button>
                    <Permissions editors={editors} setEditors={setEditors} />
                </form>
            </div>
            {doesExist == 1 && (
                <div id="error-message">
                    <p className="text-red-600 text-xl text-center">Project already exists.</p>
                </div>
            )}
        </div>
    )
}
"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Components
import Permissions from '@/app/shared/components/projectPermissions';
import BackBtnBar from '@/app/shared/components/backBtnBar';

// Other
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");
    const [doesExist, setDoesExist] = useState(0);
    const [editors, setEditors] = useState<string[]>([]);

    const newProjectSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (name != null && name.trim() != "" && user?.email) {
            const exists = await fetch("http://localhost:3001/projects/exists", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: user?.email })
            });
            let response = await exists.json();
            if (response[0]?.ProjectExists == 1) {
                setDoesExist(1);
                setTimeout(() => {
                    setDoesExist(0);
                }, 3000);
            }
            if (response[0]?.ProjectExists == 0 && user?.email) {
                const getUser = await fetch("http://localhost:3001/users/details", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user?.email })
                })
                response = await getUser.json();

                if (response[0].user_id) {
                    const id = response[0].user_id;
                    const createProject = await fetch(`http://localhost:3001/projects/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: name.trim(), owner: id }),
                    })
                    response = await createProject.json();

                    if (response.error == null) {
                        editors.forEach(async (editor) => {
                            console.log("Processing Email:", editor);
                            const inviteUser = await fetch(`http://localhost:3001/invites/send`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: editor, project: name.trim() }),
                            })

                            console.log("Email:", await inviteUser.json());
                        })

                        router.push("/");
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
                </form>
                <Permissions editors={editors} setEditors={setEditors} />
            </div>
            {doesExist == 1 && (
                <div id="error-message">
                    <p className="text-red-600 text-xl text-center">Project already exists.</p>
                </div>
            )}
        </div>
    )
}
"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Components
import Permissions from '@/app/shared/components/projectPermissions';
import BackBtnBar from '@/app/shared/components/backBtnBar';

// Other
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

// Interfaces
import { ParamProps } from "@/app/shared/interfaces/paramProps";

function Home({ params }: ParamProps) {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");
    const [projectID, setProjectID] = useState(0);
    const [editors, setEditors] = useState<string[]>([]);

    const getProjectID = useCallback(async () => {
        const resolvedParams = await params;
        if (resolvedParams) {
            setProjectID(Number.parseInt(resolvedParams.slug[0]));

            const details = await fetch("http://localhost:3001/projects/details", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: resolvedParams.slug })
            })
            const response = await details.json();

            if (response[0].name) {
                setName(response[0].name);
            }
        }
    }, [params]);

    useEffect(() => {
        getProjectID();
    }, [getProjectID]);



    useEffect(() => {
        if (!user || !sessionStorage.getItem('token')) {
            router.push("/");
        }
    }, [user])

    const saveProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (name && name.trim() != "" && user?.email) {
            const exists = await fetch("http://localhost:3001/projects/exists", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email: user?.email })
            });
            const response = await exists.json();

            if (response[0]?.ProjectExists == 0) {
                await fetch("http://localhost:3001/projects/changeName", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, id: projectID })
                });
            }

            editors.forEach(async (editor) => {
                console.log("Processing Email:", editor);
                const inviteUser = await fetch("http://localhost:3001/invites/send", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: editor, project: name }),
                })

                console.log("Email:", await inviteUser.json());
            })

            router.push("/");
        }
    }

    return (
        <div>
            <BackBtnBar />
            <div className="flex min-h-screen">
                {/* Center Project Name Section */}
                <div className="flex-1 flex justify-center items-start mt-16">
                    <div className="bg-slate-900 py-8 px-12 rounded-lg w-auto">
                        <form onSubmit={(e) => saveProject(e)} className="flex flex-col items-center">
                            <div className='flex items-center justify-between w-full mb-8'>
                                <label htmlFor="name" className="text-2xl text-slate-200 whitespace-nowrap">
                                    Edit Project Name:
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    placeholder="Edit Project Name"
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-lg bg-slate-800 p-2 text-2xl ml-4 w-[300px] text-white"
                                />
                            </div>
                            <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side Permissions */}
                <div className="w-[400px] pr-4 mr-16">
                    <Permissions project={projectID} editors={editors} setEditors={setEditors} />
                </div>
            </div>
        </div>
    )
}

export default withAuth(Home);
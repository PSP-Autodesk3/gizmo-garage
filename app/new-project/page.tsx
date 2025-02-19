"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import BackBtnBar from '@/app/backBtnBar';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clear } from 'console';

interface tags {
    tag_id: number;
    name: string;
}

export default function Home() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [name, setName] = useState("");
    const [doesExist, setDoesExist] = useState(0);
    const [tags, setTags] = useState<tags[]>([]);
    const [appliedTags, setAppliedTags] = useState<tags[]>([]);
    const [alreadyApplied, setAlreadyApplied] = useState(0);

    const newProjectSubmitted = async (e: any) => {
        e.preventDefault()
        if (name != null && name.trim() != "") {
            const exists = await fetch(`/api/getProjectExists?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            let response = await exists.json();
            console.log("Response", response);
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
                console.log("Response", response);

                if (response[0].user_id) {
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

    useEffect(() => {
        data();
    }, []);

    const data = async () => {
        if (user?.email) {
            const Data = await fetch(`/api/getAllTags?email=${encodeURIComponent(user?.email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            const tagData = await Data.json();
            setTags(tagData);
        }
    }

    
    const applyTag = (index: number) => {
        const appliedTag = tags[index];
        if (!(appliedTags.includes(appliedTag))) {
            setAppliedTags([...appliedTags, appliedTag]);
            setAlreadyApplied(0);           
        }
        else {
            setAlreadyApplied(1);
        }

    }

    const unapplyTag = (index: number) => {
        setAppliedTags(appliedTags.filter(tag => tag.tag_id !== index));
    }

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
                    <div id='tags'>
                        {tags.map((tag, index) => (
                            <>
                                {console.log(tag.name)}
                                <button className='rounded-full m-2 p-2 bg-blue-600' key={index} onClick={() => applyTag(index)}>{tag.name}</button>
                            </>
                        ))}
                    </div>

                    <div id='appliedTags'>
                        {
                            appliedTags.map((appliedTag) => (
                                <>
                                <button className='rounded-full m-2 p-2 bg-blue-600' key={appliedTag.tag_id} onClick={() => unapplyTag(appliedTag.tag_id)}>{appliedTag.name}</button>
                                </>
                            ))
                        }
                    </div>
                    <button
                        className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Submit</button>
                </form>
                {alreadyApplied == 1 && (
                    <>
                    <div className='text-red-500'>Already Applied</div>
                    </>
                )}
            </div>
            {doesExist == 1 && (
                <div id="error-message">
                    <p className="text-red-600 text-xl text-center">Project already exists.</p>
                </div>
            )}
        </div>
    )
}
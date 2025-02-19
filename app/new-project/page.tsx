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
    const [query, setQuery] = useState<string>('');
    const [filteredTags, setFilteredTags] = useState<tags[]>([]);

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
            setFilteredTags(tagData);
        }
    }


    const applyTag = (index: number) => {
        console.log("index:",index);
        const appliedTag = tags.find(tag => tag.tag_id == index);
        console.log("appliedTag:",appliedTag);
        console.log("tags:",tags);
        if (appliedTags && appliedTag && !appliedTags.includes(appliedTag)) {
            setAppliedTags([...appliedTags, appliedTag]);
            setAlreadyApplied(0);
        }
        else {
            setAlreadyApplied(1);
        }

    }

    useEffect(() => {
        if (query.trim() == '') {
            setFilteredTags(tags);
            console.log("nothing");
          }
          else {
            console.log("filtered");
            //display where the search equals the query or matches at least one of the tags
            setFilteredTags(tags.filter(tags => tags.name.toLowerCase().includes(query.trim())));
          }
    },[query]);

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
                    <div id="search" className='p-4'>
                        <label htmlFor="search=bar">Search</label>
                        <input
                            className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
                            type="text"
                            placeholder="Search"
                            name="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div id='tags'>
                        {filteredTags.map((tag) => (
                            <>
                                <button className='rounded-full m-2 p-3 bg-blue-600' key={tag.tag_id} onClick={() => applyTag(tag.tag_id)}>{tag.name}</button>
                            </>
                        ))}
                    </div>
                    <div id='appliedTags'>
                        {
                            appliedTags.map((appliedTag) => (
                                <>
                                    <button className='flex rounded-full m-2 p-3 bg-blue-600' key={appliedTag.tag_id} onClick={() => unapplyTag(appliedTag.tag_id)}><svg className="w-6 h-6 text-blue-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                    </svg>{appliedTag.name}</button>
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
"use client";

// Other
import { useEffect, useState } from 'react';

// Firebase
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

// Interfaces
import { Tag } from '@/app/shared/interfaces/tag';

// OSS SDK
import { ObjectDetails, OssClient } from "@aps_sdk/oss";

interface ModuleProps {
    itemType: string;
    projectID: number;
    id: number;
    type: number;

    setConfirmModule: (value: boolean) => void;
    setDuplicate: (value: number) => void;

    getData: () => Promise<void>;
    allTags: Tag[];

    filteredTags: Tag[];
    setFilteredTags: (value: Tag[]) => void;
}

export default function ConfirmModule({ itemType, projectID, type, id, setConfirmModule, setDuplicate, getData, filteredTags, allTags, setFilteredTags }: ModuleProps) {
    const [folderName, setFolderName] = useState('');
    const [user] = useAuthState(auth);
    const [itemName, setItemName] = useState('');
    const [tagQuery, setTagQuery] = useState<string>('');
    const [alreadyApplied, setAlreadyApplied] = useState(0);
    const [appliedTags, setAppliedTags] = useState<Tag[]>([]);

    useEffect(() => {
      if (tagQuery != '') {
        setFilteredTags(allTags.filter(tags => tags.tag.toLowerCase().includes(tagQuery.trim())));
      } else {
        setFilteredTags(allTags);
      }
    }, [tagQuery]);

    // Create new folder
    const newFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        // Prevents for from reloading the page
        e.preventDefault();

        // Check for duplicates
        const alreadyExists = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/exists`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: folderName.trim(), projectid: projectID, type, parent_folder_id: id }),
        });
        const resp = await alreadyExists.json();

        if (resp.FolderExists === 1) { // If duplicates -> display message
            setDuplicate(1);
            setTimeout(() => {
                setDuplicate(0);
            }, 3000);
        } else { // If no duplicates -> create folder
            await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/create`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: folderName.trim(), projectid: projectID, folder_id: id, type }),
            });
            // Gets the updated list
            getData();
        }
        setConfirmModule(false);
        setFolderName("");
    }

    // Create new item
    const newItem = async (e: React.FormEvent<HTMLFormElement>) => {
        // Prevents for from reloading the page
        e.preventDefault();

        // Reset selected tags
        setAppliedTags([]);

        // Check duplicates 
        const alreadyExists = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/exists`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName.trim(), projectid: projectID, folder_id: id, type }),
        });
        const resp = await alreadyExists.json();

        if (resp.ItemExists === 1) { // If duplicates -> display message
            setDuplicate(2);
            setTimeout(() => {
                setDuplicate(0);
            }, 3000);
        } else if (user) { // If no duplicates -> create file
            // Create bucket
            const token = await sessionStorage.getItem("token"); // Get token
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/oss/create`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token }),
            });
            const data = await response.json();
            const bucketKey = data.bucketKey;
            // Create item in DB and pass through created bucket key
            await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/create`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName: itemName.trim(), email: user.email, project: projectID, id, type, bucketKey }),
            });
            // Check bucket created
            await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/oss/getBuckets`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token }),
            });
            // Gets the updated list
            getData();
        }
        setConfirmModule(false);
        setItemName("");
    }

    const applyTag = (index: number) => {
        const appliedTag = allTags.find(tag => tag.tag_id == index);
        if (appliedTags && appliedTag && !appliedTags.includes(appliedTag)) {
            setAppliedTags([...appliedTags, appliedTag]);
        }
        else {
            setAlreadyApplied(1);
            setTimeout(() => {
                setAlreadyApplied(0);
            }, 1000);
        }
    }

    const removeTag = (index: number) => {
        setAppliedTags(appliedTags.filter(tag => tag.tag_id !== index));
    }

    if (itemType === "Folder") {
        return (
            <form className="text-center" onSubmit={(e) => newFolder(e)}>
                <h1 className='text-3xl'>Folder name</h1>
                <input
                    name="folder-name"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full mt-4 p-2 rounded-lg bg-slate-800"
                    placeholder="Enter folder name"
                    id="dir-name-input"
                />
                <div className="mt-4">
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Create
                    </button>
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                        onClick={() => setConfirmModule(false)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }
    else if (itemType === "File") {
        return (
            <form className="text-center" onSubmit={(e) => newItem(e)}>
                <h1 className='text-3xl'>Item name</h1>
                <input
                    name="item-name"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full mt-4 p-2 rounded-lg bg-slate-800"
                    placeholder="Enter Item name"
                />
                <div >
                    <div id="search" className='p-4'>
                        <label htmlFor="search=bar">Search</label>
                        <input
                            className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
                            type="text"
                            placeholder="Search"
                            name="search"
                            value={tagQuery}
                            onChange={(e) => setTagQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        {
                            filteredTags.map((tag: Tag) => (
                                <>
                                    <button type="button" className='rounded-full m-2 p-3 bg-blue-600' onClick={() => applyTag(tag.tag_id)} key={tag.tag_id}>{tag.tag}</button>
                                </>
                            ))
                        }
                    </div>

                    <div id='appliedTags'>
                        {
                            appliedTags.map((tag: Tag) => (
                                <>
                                    <button type='button' className='rounded-full m-2 p-3 bg-blue-600 flex' onClick={() => removeTag(tag.tag_id)} key={tag.tag_id}><svg className="w-6 h-6 text-blue-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                    </svg>{tag.tag}</button>
                                </>
                            ))
                        }

                        <div>
                            {alreadyApplied === 1 && (
                                <span className='text-red-500'>Already Applied</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Create
                    </button>
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                        onClick={() => setConfirmModule(false)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }
    else {
        console.log("None");
    }
}
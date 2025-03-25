"use client";

// Other
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Firebase
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

// Interfaces
import { Tag } from '@/app/shared/interfaces/tag';

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
    const router= useRouter();

    // File uploads
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async (bucketKey: string) => {
        if (!file) {
            setMessage("No file selected");
            return;
        }
        setMessage("");
        const formData = new FormData();
        formData.append("file", file);
        const token = sessionStorage.getItem("token");
        if (token) {
            formData.append("token", token);
        }
        if (bucketKey) {
            formData.append("bucketKey", bucketKey);
        }
        try {
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/oss/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            const urn = data.urn;
            const objectKey = data.objectKey;
            if (data.ok) {
                setMessage("File uploaded successfully");
            } else {
                setMessage("Error uploading file");
            }
            tagVersion(bucketKey, urn, objectKey);
        }
        catch (error) {
            setMessage("Error uploading file");
            console.log(error);
        }
    }

    const tagVersion = async (bucketKey: string, urn: string, objectKey: string) => {
        try {
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/tag`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bucket_id: bucketKey, urn: urn, version: 1, object_key: objectKey }),
            });
            const data = await response.json();
            if (data.message == "Version tagged successfully") {
                console.log("Version tagged successfully");
            } else {
                console.log("Error tagging version");
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (tagQuery != '') {
            setFilteredTags(allTags.filter(tags => tags.tag.toLowerCase().includes(tagQuery.trim())));
        } else {
            setFilteredTags(allTags);
        }
    }, [tagQuery, allTags, setFilteredTags]);

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
        router.refresh();
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
                body: JSON.stringify({ itemName: itemName.trim(), email: user.email, project: projectID, id, type, bucketKey, appliedTags }),
            });
            // Upload file to bucket
            handleUpload(bucketKey);
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
                    className="w-full p-2 my-2 rounded-lg bg-indigo-100 border text-gray-800
                        dark:bg-slate-800 border-slate-700/50 dark:text-white"
                    placeholder="Enter folder name"
                    id="dir-name-input"
                />
                <div className="mt-4">
                    <button
                        className="text-white px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Create
                    </button>
                    <button
                        className="text-white px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
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
                    className="w-full p-2 my-2 rounded-lg bg-indigo-100 border text-gray-800
                        dark:bg-slate-800 border-slate-700/50 dark:text-white"
                    placeholder="Enter Item name"
                />
                <div className='dark:bg-slate-800 bg-indigo-100 border border-slate-700/50 mt-4 rounded-lg mb-4 flex flex-col items-center ' >
                    <div id="search" className='p-4'>
                        <label htmlFor="search=bar">Search</label>
                        <input
                            className='w-full p-2 my-2 rounded-lg bg-indigo-100 border border-slate-700/50 text-gray-800
                                dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                            type="text"
                            placeholder="Search"
                            name="search"
                            value={tagQuery}
                            onChange={(e) => setTagQuery(e.target.value)}
                        />
                    </div>
                    <div className='dark:bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden flex flex-wrap w-[90%]'>
                        {filteredTags.length > 0 ? (
                            filteredTags.map((tag: Tag) => (
                                <button type="button" className='m-2 rounded-full bg-blue-600 dark:text-white text-gray-800 text-sm px-4 py-2 flex items-center text-center' onClick={() => applyTag(tag.tag_id)} key={tag.tag_id}>{tag.tag}</button>
                            ))
                        ) : (
                            <span className='text-gray-800 dark:text-white m-auto p-2'>No tags found</span>
                        )
                        }
                    </div>

                    <div id='appliedTags' className='pt-5 rounded-lg my-3 flex-wrap flex p-2'>
                        {appliedTags.length > 0 ? (
                            appliedTags.map((tag: Tag) => (
                                <button type='button'
                                    className='rounded-full overflow-hidden white-space-nowrap truncate m-1 bg-blue-600 text-white text-sm px-4 py-2 flex max-w-[100px] items-center text-center'
                                    onClick={() => removeTag(tag.tag_id)}
                                    key={tag.tag_id}
                                >
                                    <svg
                                        className="w-6 h-6 flex-shrink-0 text-blue-800 dark:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="15"
                                        height="15"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18 17.94 6M18 18 6.06 6" />
                                    </svg>{tag.tag}</button>
                            ))
                        ) : (
                            <span className='text-gray-800 dark:text-white'>No tags applied</span>
                        )
                        }
                    </div>
                    <div>
                        {alreadyApplied === 1 && (
                            <span className='text-red-500'>Already Applied</span>
                        )}
                    </div>
                </div>

                <div className="px-8">
                    <input type="file" onChange={handleFileChange} className="mb-4 dark:bg-slate-800 border border-slate-700/50 bg-indigo-100 rounded-lg p-4 text-lg" />
                    <br />
                    {message && <p className="mt-2 text-sm dark:text-white text-gray-800">{message}</p>}
                </div>

                <div className="mt-4">
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 text-white"
                    >
                        Create
                    </button>
                    <button
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 text-white"
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
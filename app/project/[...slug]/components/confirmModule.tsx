"use client";

// Other
import { useState } from 'react';

// Firebase
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

interface ModuleProps {
    itemType: string;
    projectID: number;
    id: number;
    type: number;
    setConfirmModule: (value: boolean) => void;
    setDuplicate: (value: number) => void;
    getData: Function;
}

export default function ConfirmModule({ itemType, projectID, type, id, setConfirmModule, setDuplicate, getData }: ModuleProps) {
    const [folderName, setFolderName] = useState('');
    const [user] = useAuthState(auth);
    const [itemName, setItemName] = useState('');

    // Create new folder
    const newFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        // Prevents for from reloading the page
        e.preventDefault();

        // Check for duplicates
        const alreadyExists = await fetch("/api/getFolderExists", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: folderName.trim(), projectid: projectID, type, parent_folder_id: id }),
        });
        const resp = await alreadyExists.json();

        if (resp[0].FolderExists === 1) { // If duplicates -> display message
            setDuplicate(1);
            setTimeout(() => {
                setDuplicate(0);
            }, 3000);
        } else { // If no duplicates -> create folder
            await fetch("/api/createFolder", {
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

        // Check duplicates 
        const alreadyExists = await fetch("/api/getItemExists", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName.trim(), projectid: projectID, folder_id: id, type }),
        });
        const resp = await alreadyExists.json();

        if (resp[0].ItemExists === 1) { // If duplicates -> display message
            setDuplicate(2);
            setTimeout(() => {
                setDuplicate(0);
            }, 3000);
        } else if (user) { // If no duplicates -> create file
            await fetch("/api/createItem", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName: itemName.trim(), email: user.email, project: projectID, id, type }),
            });
            
            // Gets the updated list
            getData();
        }
        setConfirmModule(false);
        setItemName("");
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
import React, { useEffect, useState } from 'react';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

interface PermissionsProps {
    project?: number;
    editors: string[];
    setEditors: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Emails {
    email: string;
}

export default function Permissions({ project, editors, setEditors }: PermissionsProps) {
    const [emails, updateEmails] = useState<Emails[]>([]);
    const [invites, updateInvites] = useState<Emails[]>([]);

    useEffect(() => {
        if (project && project > 0) {
            const getAccounts = async () => {
                const response = await fetch("http://localhost:3001/projects/editors", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: project })
                })
                
                const emailResponse = await response.json()
                updateEmails(emailResponse);
                if (emailResponse && emailResponse.length > 0) {
                    setEditors(emailResponse[0].email.toLowerCase());
                }
            }
            getAccounts();

            const getInvited = async () => {
                const response = await fetch("http://localhost:3001/projects/invited", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: project })
                })

                const emailResponse = await response.json();
                updateInvites(emailResponse);
            }
            getInvited();
        }
    }, [project, setEditors])

    if (project) {
        return (
            <>
                <div className="bg-slate-900 p-4 rounded-lg shadow-lg mt-4">
                    <h1 className="text-2xl font-semibold text-slate-200 mb-4">Project Permissions</h1>
                    <h1 className="text-xl font-semibold text-slate-200 mb-4">Added Accounts</h1>
                    {emails.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="text-left text-slate-200">Email</th>
                                    <th className="text-left text-slate-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((email, index) => (
                                    <tr key={index} className="border-t border-slate-800">
                                        <td className="p-2 text-slate-400">{email.email}</td>
                                        <td className="p-2 text-right">
                                            <button className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody> 
                        </table>
                ) : (
                    <p className="text-slate-400">No accounts added</p>
                )}
                    <h1 className="text-xl font-semibold text-slate-200 mb-4 mt-4">Pending Invites</h1>
                    {invites.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="text-left text-slate-200">Email</th>
                                    <th className="text-left text-slate-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite, index) => (
                                    <tr key={index} className="border-t border-slate-800">
                                        <td className="p-2 text-slate-400">{invite.email}</td>
                                        <td className="p-2 text-right">
                                            <button
                                                // onClick={() => handleDeleteInvite(invite.email)}
                                                className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-slate-400">No pending invites</p>
                    )}
                    <div className="mt-6">
                        <EmailSender editors={editors} setEditors={setEditors} />
                    </div>
                </div>
            </>
        );
    }
    return (
        <EmailSender editors={editors} setEditors={setEditors} />
    );
}

interface EmailSenderProps {
    editors: string[];
    setEditors: React.Dispatch<React.SetStateAction<string[]>>;
}

const EmailSender = ({ editors, setEditors }: EmailSenderProps) => {
    const [user] = useAuthState(auth);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string>("");

    // For reseting the error so it doesnt stay on the screen
    useEffect(() => {
        if (emailError) { 
            const timer = setTimeout(() => {
                setEmailError(""); 
            }, 3000); 

            return () => clearTimeout(timer);
        }
    }, [emailError]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const sendInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEmailError("");

        if (!editors.includes(email.toLowerCase()) && user?.email !== email.toLowerCase()) {
            console.log(editors);
            if (validateEmail(email)) {
                const parentDiv = document.getElementById("emails");

                // div for each email 
                const childDiv = document.createElement("div");
                childDiv.className = "flex justify-between items-center p-2 mb-2 bg-slate-800 rounded-lg";
                parentDiv?.appendChild(childDiv);

                const p = document.createElement("p");
                p.className = "text-slate-400";
                p.innerHTML = email;
                childDiv.appendChild(p);

                const button = document.createElement("button");
                button.className = "px-4 py-2 text-sm ml-4 font-medium bg-red-600 rounded-lg transition-all duration-300 hover:bg-red-500 hover:scale-105 shadow-lg hover:shadow-red-500/50";
                button.innerHTML = "Remove";
                button.onclick = () => {
                    parentDiv?.removeChild(childDiv);
                    setEditors(editors.filter((e) => e !== email));
                };
                childDiv.appendChild(button);

                setEditors([...editors, email.toLowerCase()]);
                setEmail("");
            } else {
                setEmailError("Please enter a valid email address");
                return;
            }
        } else {
            setEmailError("This email has already been added");
            return;
        }
    }

    return (
        <div>
            <form onSubmit={sendInvite} className="mb-4">
                <p className="text-xl font-semibold text-slate-200 mb-2">Invite to project</p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="Enter email to invite"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`flex-1 text-white p-2 rounded-lg bg-slate-800 ${
                            emailError ? 'border-2 border-red-500' : ''
                        }`}
                    />
                    {emailError && (
                        <p className="text-red-500 text-sm">{emailError}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 mt-2"
                    >
                        Add
                </button>
            </form>
            <div id="emails" className="mt-4">
                <p className="text-xl font-semibold text-slate-200 mb-2">Proposed Editors:</p>
            </div>
        </div>
    );
}
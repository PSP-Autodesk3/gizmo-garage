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
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (project && project > 0) {
            console.log("ID:", project)
            const getAccounts = async () => {
                const response = await fetch(`/api/getProjectEditors?project_id=${project}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
                
                const emailResponse = await response.json()
                updateEmails(emailResponse);
                setEditors(emailResponse[0].email.toLowerCase());
                console.log(emailResponse[0]);
            }
            getAccounts();
        }
    }, [project])

    if (project) {
        return (
            <>
                <h1>Added Accounts</h1>
                {emails.length > 0 ? (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((email, index) => (
                                    <tr key={index}>
                                        <td>{email.email}</td>
                                        <button>Delete</button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>No accounts added</p>
                )}
                <EmailSender editors={editors} setEditors={setEditors} />
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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const sendInvite = async (e: any) => {
        e.preventDefault();

        if (!editors.includes(email.toLowerCase()) && user?.email !== email.toLowerCase()) {
            console.log(editors);
            if (validateEmail(email)) {
                const parentDiv = document.getElementById("emails");

                const childDiv = document.createElement("div");
                parentDiv?.appendChild(childDiv);

                const p = document.createElement("p");
                p.innerHTML = email;
                childDiv.appendChild(p);

                const button = document.createElement("button");
                button.innerHTML = "Remove";
                button.onclick = () => {
                    parentDiv?.removeChild(childDiv);
                    setEditors(editors.filter((e) => e !== email));
                };
                childDiv.appendChild(button);

                setEditors([...editors, email.toLowerCase()]);
                setEmail("");
            } else {
                console.log("Invalid email");
            }
        } else {
            console.log("Email already exists");
        }
    }

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendInvite;
                }}
            >
                <p>Invite to project</p>
                <input
                    type="email"
                    placeholder="Enter email to invite"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button onClick={sendInvite}>Add</button>
            </form>
            <div id="emails">
                <p>Proposed Editors:</p>
            </div>
        </>
    );
}
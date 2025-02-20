import { useEffect, useState } from 'react';

interface PermissionsProps {
    project?: string;
}

export default function Permissions({ project }: PermissionsProps) {
    const [emails, updateEmails] = useState<string[]>([]);

    useEffect(() => {
        if (project) {
            const getAccounts = async () => {
                const response = await fetch(`/api/getProjectEditors?project=${project}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })

                updateEmails(await response.json());
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
                                {emails.map((email) => (
                                    <tr key={email}>
                                        <td>{email}</td>
                                        <button>Delete</button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>No accounts added</p>
                )}
                <EmailSender />
            </>
        );
    }
    return (
        <EmailSender />
    );
}

const EmailSender = () => {
    const [email, setEmail] = useState("");
    const [editors, setEditors] = useState<string[]>([]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const sendInvite = async (e: any) => {
        e.preventDefault();

        if (!editors.includes(email)) {
            if (validateEmail(email)) {
                const div = document.getElementById("emails");
                const p = document.createElement("p");
                p.innerHTML = email;
                div?.appendChild(p);
                setEditors([...editors, email]);


            } else {
                console.log("Invalid email");
            }
        } else {
            console.log("Email already exists");
        }
    }

    return (
        <>
            <form>
                <p>Invite to project</p>
                <input
                    type="email"
                    placeholder="Enter email to invite"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="button" onClick={sendInvite}>Invite</button>
            </form>
            <div id="emails">
                <p>Proposed Editors:</p>
            </div>
        </>
    );
}
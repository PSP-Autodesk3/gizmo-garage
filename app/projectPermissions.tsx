import { useState } from 'react';

interface PermissionsProps {
    project?: string;
}

export default function Permissions({ project }: PermissionsProps) {
    const [emails, updateEmails] = useState<string[]>([]);

    useState(() => {
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
    })

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

const EmailSender = async () => {
    return (
        <form action="">

        </form>
    );
}
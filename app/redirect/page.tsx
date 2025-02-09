"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect } from 'react';

function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const client_id = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_SECRET;
    const basicAuth = btoa(`${client_id}:${client_secret}`);

    useEffect(() => {
        // Translates auth code into token.
        const fetchToken = async () => {
            // If the code hasn't been returned, there is an error.
            if (!code) {
                // Identify message to display to user.
                let errorMessage = "Authorization code was not returned by AutoDesks servers.";
                if (error) {
                    errorMessage = "Authorization failed.";
                }
                sessionStorage.setItem("errorMessage", errorMessage);

                // Set description for more details if supplied.
                if (errorDescription) {
                    sessionStorage.setItem("errorDescription", errorDescription);
                }
                return;
            }
            // If AutoDesks redirect is okay.
            else {
                // API call to exchange auth for token.
                const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${basicAuth}` , Accept: 'application/json'},
                    body: new URLSearchParams({ grant_type: "client_credentials", redirect_uri: "http://localhost:3000/redirect", scope: "data:read data:write bucket:create bucket:read" }),
                });
    
                // Handle response.
                const data = await response.json();
                if (data.access_token && response.ok) {
                    sessionStorage.setItem('token', data.access_token);
                } else {
                    sessionStorage.setItem("errorMessage", "Error exchanging Auth for token.");
                }
            }
        }

        fetchToken();
        router.push("/");
    }, [code, basicAuth])

    return (
        <div>
            <p>Handling Authentication...</p>
        </div>
    )
}

export default withAuth(Home);
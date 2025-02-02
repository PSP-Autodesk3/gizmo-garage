"use client";

import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const client_id = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_SECRET;
    const basicAuth = btoa(`${client_id}:${client_secret}`);

    useEffect(() => {
        // Process Auth
        
        const fetchToken = async () => {
            if (!code) {
                console.error('Authorization code is missing.');
                return;
            }
            const code_verifier = sessionStorage.getItem('code_verifier');
            if (!code_verifier) {
                console.error('PKCE is missing.');
                return;
            }
            const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${basicAuth}` },
                body: new URLSearchParams({ code: code, grant_type: "authorization_code", redirect_uri: "http://localhost:3000/redirect", code_verifier: code_verifier, scope: "data:read data:write bucket:create bucket:read" }),
            });

            // CREATES AN ERROR UNTIL CODE CHALLENGE IS FIXED
            const data = await response.json();
            if (!response.ok) {
                console.error('Error response:', data);
            } else {
                console.log('Access token data:', data);
                sessionStorage.setItem('token', data.access_token);
            }
    
            console.log(response);
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
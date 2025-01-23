"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const client_id = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_SECRET;
    const basicAuth = btoa(`${client_id}:${client_secret}`);

    useEffect(() => {
        // Process Auth

        // DEBUG - REMOVE FROM FROM FINAL VERSION
        console.log(client_id);
        console.log(client_secret);
        console.log(basicAuth);
        console.log(code);

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
                body: new URLSearchParams({ code: code, grant_type: "authorization_code", redirect_uri: "http://localhost:3000/redirect", code_verifier: code_verifier }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Error response:', data);
            } else {
                console.log('Access token data:', data);
                const { refresh_token, expires_in } = data;

                // Schedule token refresh
                setTimeout(() => {
                    refreshAccessToken(refresh_token);
                }, (expires_in - 60) * 1000); // Refresh 1 minute before expiration, as to avoid errors with delays
            }

            console.log(response);
        }

        const refreshAccessToken = async (refresh_token: string) => { 
            // Sending a request to api to refresh access token, including things like the refresh token
            const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${basicAuth}` },
                body: new URLSearchParams({ refresh_token: refresh_token, grant_type: "refresh_token" }),
            });

            const data = await response.json(); // Storing that response in 'data'
            if (!response.ok) {
                // Log error if it goes wrong
                console.error('Error response:', data); 
            } else {
                console.log('Refreshed token data:', data);
                const { refresh_token, expires_in } = data;

                // Schedule next token refresh
                setTimeout(() => {
                    refreshAccessToken(refresh_token);
                }, (expires_in - 60) * 1000); // Refresh 1 minute before expiration, *1000 converts expires_in from seconds to milliseconds, as setTimeout needs milliseconds.
            }
        }

        fetchToken();

        //router.push("/");
    }, [code, basicAuth])

    return (
        <div>
            <p>Handling Authentication...</p>
        </div>
    )
}
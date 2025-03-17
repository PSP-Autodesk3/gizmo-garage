"use client";

// Middleware
import withAuth from '@/app/lib/withAuth';

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Components
import AuthenticatePrompt from '@/app/shared/components/authenticatePrompt';

// Other
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function Home() {
    const [user, loadingAuth] = useAuthState(auth);
    const [loginErrorMessage, setLoginErrorMessage] = useState('');
    const router = useRouter();

    // Checks if the autodesk authentication returned an error
    const getError = async () => {
        // Gets error message to display on screen
        let errorSession = sessionStorage.getItem("errorMessage");
        if (errorSession) {
            setLoginErrorMessage(errorSession);
            sessionStorage.removeItem("errorMessage");
        }

        // Prompts to check console if a description is given
        errorSession = sessionStorage.getItem("errorDescription");
        if (errorSession) {
            console.log("Error Description:", errorSession);
            sessionStorage.removeItem("errorDescription");
        }
    }
    getError();

    useEffect(() => {
        // Redirects if the user is not logged into their account
        if (!loadingAuth && !user) {
          router.replace('/landing');
        }
      }, [loadingAuth, router]);

    useEffect(() => {
        if (sessionStorage.getItem("token")) {
            router.push("/");
        }
    }, [user])

    if (!user && !loadingAuth) {
        router.push("/landing");
    }

    return (
        <AuthenticatePrompt loginErrorMessage={loginErrorMessage} />
    )
}

export default withAuth(Home);
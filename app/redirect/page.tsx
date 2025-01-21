"use client";

import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    useEffect(() => {
        // Process Auth
        console.log(code);
        console.log(state);
        router.push("/");
    })

    return (
        <div>
            <p>Handling Authentication...</p>
        </div>
    )
}
"use client";

// Middleware
import withAuth from '@/app/lib/withAuth';

// Components
import SigningIn from '@/app/shared/components/signingIn';

function Home() {
    return (
        <>
          <SigningIn />
        </>
    )
}

export default withAuth(Home);
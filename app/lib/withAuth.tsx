// Wrappers from Next.js docs. This is effectively middleware, but
// middleware can only run server side and due to this using session
// variables and firebase auth, it needs to run client side.

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// For Firebase Auth
import { auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function withAuth(WrappedComponent: React.ComponentType<any>) {
  return function ProtectedRoute(props: any) {
    const [user, loading] = useAuthState(auth);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [sessionLoading, setSessionLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    // List of routes that are exempt from this middleware
    const protectedRoutes = ["/", "/login", "/register", "/redirect"];

    useEffect(() => {
      setSessionToken(sessionStorage.getItem("token"));
      setSessionLoading(false);
    }, []);

    useEffect(() => {
      // If something is invalid, redirect to the home screen, which will deal with logging in and authenticating
      if (!sessionLoading && !loading && !protectedRoutes.includes(pathname) && (!user || !sessionToken)) {
        router.push("/");
      }
    }, [loading, user, sessionToken, sessionLoading, pathname, router]);

    // Continue if authenticated
    return <WrappedComponent {...props} />;
  };
}

// Wrappers from Next.js docs. This is effectively middleware, but
// middleware can only run server side and due to this using session
// variables and firebase auth, it needs to run client side.

// Firebase
import { auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

// Other
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ProtectedRoute(props: T) {
    const [user, loading] = useAuthState(auth);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [sessionLoading, setSessionLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      setSessionToken(sessionStorage.getItem("token"));
      setSessionLoading(false);
    }, []);

    useEffect(() => {
      // List of routes that are exempt from this middleware
      const protectedRoutes = ["/", "/login", "/register", "/redirect", "/admin-settings"];

      const checkRedirect = async () => {
        // If nothing is loading
        if (!sessionLoading && !loading) {
          if ((!user || !sessionToken) && !protectedRoutes.includes(pathname)) {
            // If the user isn't signed in, return to home
            router.push("/");
          } else if (user && !sessionToken) {
            // If the user is signed in, not autodesk authenticated, but the database doesn't exist, add admin-settings to the protected page
            const response = await fetch("/api/getDatabaseExists");
            const exists = await response.json();
            if (exists[0]?.DatabaseExists === 0 && pathname !== "/admin-settings") {
              router.push("/");
            }
          }
        }
      };

      checkRedirect();
    }, [loading, user, sessionToken, sessionLoading, pathname, router]);

    return <WrappedComponent {...props} />;
  };
}
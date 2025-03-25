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
      const protectedRoutes = ["/", "/login", "/register", "/redirect", "/admin-settings", "/landing", "/authenticate"]; // To fix: make admin-settings not a protected route. Only for devel.

      const checkRedirect = async () => {
        // If nothing is loading
        if (!sessionLoading && !loading) {
          if ((!user || !sessionToken) && !protectedRoutes.includes(pathname)) {
            // If the user isn't signed in, return to home
            router.push("/");
          } else if (user && !sessionToken) {
            // If the user is signed in, not autodesk authenticated, but the database doesn't exist, add admin-settings to the protected page
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/database/exists`);
            const exists = await response.json();
            if (exists[0]?.DatabaseExists === 0 && pathname !== "/admin-settings") {
              router.push("/");
            }
          }
        }
      };
      checkRedirect();
    }, [loading, user, sessionToken, sessionLoading, pathname, router]);

    // Editor middleware
    useEffect(() => {
        if (user) {
          // List of routes this middleware applies to
        const editorRoutes:string[] = ["/item", "/project"];
        if (editorRoutes.some(route => pathname.includes(route))) {
          if (pathname.includes("/item")) {
            const itemId = parseInt(pathname.split("/")[2], 10);
            const checkRedirect = async () => {
              const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/info`, { 
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: itemId }),
              });
              const data = await response.json();
              const projectID = data[0]?.project_id;
              const email = user?.email;
              const checkDetails = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/projects/get`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              });
              const details = await checkDetails.json();
              const ids = details.map((project: { project_id: number }) => project.project_id);
              if (!ids.includes(projectID)) {
                console.log("Redirecting");
                router.push("/");
              }
            }
            checkRedirect();
          } else if (pathname.includes("/project")) {
            const checkRedirect = async () => {
              // Extract the project ID from the URL
              const projectID:number = parseInt(pathname.split("/")[2].split("+")[0], 10);
              // Get User ID from firebase
              const email = user?.email;
              const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/projects/get`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              });
              const data = await response.json();
              const ids = data.map((project: { project_id: number }) => project.project_id);
              if (!ids.includes(projectID)) {
                router.push("/");
              }
            }
            checkRedirect();
          }
        }
        }
    }, [user]);

    return <WrappedComponent {...props} />;
  };
}
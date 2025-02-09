"use client";

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// import Image from 'next/image';

// Format returned by api call to getProjects
interface Project {
  project_id: number,
  name: string,
  ownsProject: number,
  error: string
}

function Home() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true); // Needs a check once implemented into db as currently this makes everyone admin
  const [databaseErrorMessage, setDatabaseErrorMessage] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [projects, setProjects] = useState<Project[]>([] as Project[]);
  const [loading, setLoading] = useState(true);

  // Runs APIs
  useEffect(() => {
    // Only runs if the user has logged in
    if (user) {
      const getDatabaseData = async () => {
        const response = await fetch("/api/getDatabaseExists");
        const exists = await response.json();
        console.log("Exists:", exists);
        if (exists[0].DatabaseExists != 1 || exists.error != null) {
          setDatabaseErrorMessage("Database not found, contact your system administrator");
        } 
        // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
        else if (sessionStorage.getItem('token') != '') {
          // Fetches data, needs moving to apis and is temporary for testing
          const fetchProjectData = async () => {
            if (user?.email) {
              const data = await fetch(`/api/getProjects?email=${encodeURIComponent(user?.email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
              setProjects(await data.json());
              if (!data.ok) {
                setDatabaseErrorMessage("Database not found, contact your system administrator");
              }
            }
          }
          fetchProjectData();
        }
      }
      getDatabaseData();
    }

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
    // Removes the need to check if the app isn't in a position to receive this error
    if (user && !sessionStorage.getItem('token')) {
      getError();
    }
    setLoading(false);
  }, [user]);

  // Displays if any of the details are loading
  if (loading || loadingAuth) {
    return (
      <>
        <p>Loading Resources...</p>
      </>
    )
  }

  // Displays if the user is logged in, but the database doesn't exist
  if (databaseErrorMessage) {
    // Message for admin
    if (admin) {
      return (
        <>
          <p>Database not found, please initialise the database in admin settings when ready</p>
          <button onClick={() => router.push("/admin-settings")}>Admin Settings</button>
          <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
            Sign Out
          </Link>
        </>
      )
    }
    // Message for other users
    return (
      <>
        <p>{databaseErrorMessage}</p>
        <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Sign Out
        </Link>
      </>
    )
  }
  
  // Displays if the user is not logged into their account
  if (!user) {
    return (
      <>
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl text-center font-semibold">
              Gizmo Garage
            </h1>
            <Link href="/login" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
              Sign in to your account
            </Link>
            <Link href="/register" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
              Create an account
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Displays if the user doesn't have a valid token
  if (!sessionStorage.getItem('token')) {
    return (
      <div className="float-right my-2 mx-4 space-x-4">
        <button
          onClick={() => router.push(`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=${encodeURIComponent("data:read bucket:create bucket:read")}`)}
          className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
        >
          Authenticate with AutoDesk
        </button>
        {loginErrorMessage && (
          <div id="error-message">
            <p>{loginErrorMessage}</p>
            <p>Open the console to view more details</p>
          </div>
        )}
        <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Sign Out
        </Link>
      </div>
    )
  }

  return (
    <>
      <div id="side-bar">
        {/*
        <Image
          src="source"
          alt="Logo"
          width={25}
          height={25}
        />
        */}
        <p>Gizmo Garage</p>
        <div id="filters">
          {/* Needs filters appropriate to projects, or needs removing */}
        </div>
        <div id="options">
          {admin && (
            <>
              <button onClick={() => router.push("/admin-settings")}>Admin Settings</button>
            </>
          )}
          <button onClick={() => router.push("/account-settings")}>Account Settings</button>
          <Link href="/signout">Sign Out</Link>
        </div>
      </div>
      <div id="data">
        <div id="projects">
          <h1>Projects</h1>
          {projects && (
            projects.map((project, index) => (
              <div className="project" key={index} onClick={() => router.push(`/project/${project.name.replace(' ', '+')}`)}>
                <p>{project.name}</p>
              </div>
            ))
          )}
          <div>
            <button>Create new Project</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default withAuth(Home);
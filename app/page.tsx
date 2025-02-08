"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// For Firebase Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

// Format returned by api call to getProjects
interface Project {
  project_id: Number,
  name: String,
  ownsProject: Number,
  error: String
}

export default function Home() {
  const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [projects, setProjects] = useState<Project[]>([] as Project[]);

  useEffect(() => {
    if (user) {
      const getDatabaseData = async () => {
        const response = await fetch("/api/getDatabaseExists");
        const exists = await response.json();
        console.log(exists);
        if (exists[0].DatabaseExists != 1) {
          setErrorMessage("Database not found, contact your system administrator");
        } 
        // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
        else if (sessionStorage.getItem('token') != '') {
          // Fetches data, needs moving to apis and is temporary for testing
          const fetchData = async () => {
            if (user?.email) {
              let data = await fetch(`/api/getProjects?email=${encodeURIComponent(user?.email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
              setProjects(await data.json());
              if (!data.ok) {
                setErrorMessage("Database not found, contact your system administrator");
              }
            }
          }
          fetchData();
        }
      }
      getDatabaseData();
    }
  }, [user]);

  // useEffect ensures sessionStorage is only accessed by the client to avoid errors
  useEffect(() => {
    const getError = async () => {
      // Gets error message to display on screen
      let errorSession = sessionStorage.getItem("errorMessage");
      if (errorSession) {
        setErrorMessage(errorSession);
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
  }, []);

  // Directs to account settings page
  const handleAccountSettings = async () => {
    router.push("/account-settings");
  }

  // Keeps client id out of the dom
  const handleAuthenticateRequest = async () => {
    router.push(`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=${encodeURIComponent("data:read bucket:create bucket:read")}`);
  }

  // Redirects to project view page when a project is clicked
  const projectClicked = async (e: String) => {
    router.push(`/project/${e.replace(' ', '+')}`);
  }

  const handleNewProject = async () => {
    router.push("/new-project");
  }

  // Displays if the page is still loading
  if (loading) {
    // Can be used for lazy loading?
    return (
      <>
        <div>
          <p>Loading...</p>
        </div>
      </>
    )
  }

  if (errorMessage) {
    if (admin) {
      return (
        <>
          <p>Database not found, please initiate the database in admin settings when ready {errorMessage}</p>
          <button onClick={() => router.push("/admin-settings")}>Admin Settings</button>
          <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
            Sign Out
          </Link>
        </>
      )
    }
    return (
      <>
        <p>{errorMessage}</p>
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
        <button onClick={() => handleAuthenticateRequest()} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Authenticate with AutoDesk
        </button>
        {errorMessage && (
          <div id="error-message">
            <p>{errorMessage}</p>
            <p>Open the console to view more details</p>
          </div>
        )}
        <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Sign Out
        </Link>
      </div>
    )
  }

  // Displays if all information is valid
  return (
    <>
      <div id="side-bar">
        <img src="source" alt="Logo"/>
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
          <button onClick={() => handleAccountSettings()}>Account Settings</button>
          <Link href="/signout">Sign Out</Link>
        </div>
      </div>
      <div id="data">
        <div id="projects">
          <h1>Projects</h1>
          {projects && (
            projects.map((project, index) => (
              <div className="project" key={index} onClick={() => projectClicked(project.name)}>
                <p>{project.name}</p>
              </div>
            ))
          )}
          <div>
            <button onClick={() => handleNewProject()}>Create new Project</button>
          </div>
        </div>
      </div>
    </>
  )
}

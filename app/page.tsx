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

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


//components
import Filters from './Filter';
// import NavItem from './Filter';
import SigningIn from './signingIn';
// import Image from 'next/image';

// Format returned by api call to getProjects
interface Project {
  project_id: number,
  name: string,
  ownsProject: number,
  dateOfCreation: Date,
  error: string,
  tags: projectTags[]
}


interface projectTags {
  project_id: number,
  tag: string
}

function Home() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true); // Needs a check once implemented into db as currently this makes everyone admin
  const [databaseErrorMessage, setDatabaseErrorMessage] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [projects, setProjects] = useState<Project[]>([] as Project[]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([] as Project[]);
  const [projectTags, setProjectTags] = useState<projectTags[]>([] as projectTags[])
  const [query, setQuery] = useState<string>('');
  const [SortBy, SetSortBy] = useState('newest');

  const sortArray = require('sort-array') //libarary used for sorting filter: https://www.npmjs.com/package/sort-array


  useEffect(() => {
    if (query.trim() == '') {
      setFilteredProjects(projects);
    }
    else {
      //display where the search equals the query or matches at least one of the tags
      setFilteredProjects(projects.filter(project => project.name.toLowerCase().includes(query.trim()) || project.tags.some(tag => tag.tag.toLowerCase().includes(query.trim()))));
    }
  }, [query]);
  useEffect(() => {
    // Only runs if the user has logged in
    if (user) {
      // Runs APIs
      const getDatabaseData = async () => {
        // Checks if db exists
        const response = await fetch("/api/getDatabaseExists");
        const exists = await response.json();
        if (exists[0]?.DatabaseExists !== 1 || exists.error === "Failed to check database status") {
          setDatabaseErrorMessage("Database not found, contact your system administrator");
        }
        // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
        else if (sessionStorage.getItem('token') != '') {
          // Gets projects that the user has access to
          const fetchProjectData = async () => {
            if (user?.email) {
              const data = await fetch(`/api/getProjects?email=${encodeURIComponent(user?.email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
              const tagData = await fetch(`/api/getProjectTags?email=${encodeURIComponent(user?.email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })

              const result = await data.json();
              const tagResult = await tagData.json();
              setProjects(result);
              setFilteredProjects(result);
              setProjectTags(tagResult);

              //assigns tags to projects
              result.forEach((project: Project) => {
                project.tags = tagResult.filter((tag: projectTags) => tag.project_id === project.project_id);
              });

              if (!data.ok) {
                setDatabaseErrorMessage("Database not found, contact your system administrator");
              }
              setLoadingProjects(false);
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
    getError();
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

  if (filteredProjects) {
    //goes through each UTC date from the database and updates it to display in the current systems timezone
    filteredProjects.forEach((project: Project) => {
      var UTCDate = project.dateOfCreation
      var localTimeDate = new Date(UTCDate); //found how to convert from UTC to system dateTime using this from stackOverflow, post by Hulvej on July 16th 2015: http://stackoverflow.com/questions/6525538/convert-utc-date-time-to-local-date-time - Jacob
      project.dateOfCreation = localTimeDate
    });
  }


  // Displays if the user is logged in, but the database doesn't exist
  if (databaseErrorMessage) {
    // Message for admin
    if (admin) {
      return (
        <>
          <p>Database not found, please initialise the database in admin settings or start running the server</p>
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
        <SigningIn />
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


  const handleSortBy = (event: any) => {
    SetSortBy(event.target.value)
    if (SortBy == "newest") {
      //sort filteredProjects newest first
      setFilteredProjects(sortArray(filteredProjects,{by: 'dateOfCreation', order:'asc'}))   //made using the sort-array library https://www.npmjs.com/package/sort-array   
    }
    else if (SortBy == "oldest") {
      //sort filteredProjects oldest first
      setFilteredProjects(sortArray(filteredProjects,{by: 'dateOfCreation', order:'desc'}))
    }
  };


  // Displays if all other information is valid
  return (
    <>
      <div className='flex m-auto'>
        <div id="side-bar">
          <div id="filters">
            <Filters query={query} onQueryChange={setQuery} />
          </div>
        </div>
        <div id="data" className='flex flex-row '>
          <div id="projects">
            <div className="w-[50%] py-8 m-auto gap-4 lg:absolute rounded-lg left-1/2 transform -translate-x-1/2">
              <div className="pr-8 flex flex-row justify-between">
                <h1 className='p-10 text-4xl text-white transition-colors duration-300 hover:text-gray-400 pb-10'>Projects</h1>
                <button
                  className="self-center flex justify-end px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={() => router.push("/new-project")}
                >
                  Create new Project
                </button>
              </div>

              <label>Sort By:</label>
              <select onChange={handleSortBy}>
                <option value="newest" >newest</option>
                <option value="oldest" >oldest</option>
              </select>

              {!loadingProjects ? (
                filteredProjects.map((project, index) => (
                  <div className="project" key={index}>
                    <div id="folders">
                      <div className="bg-slate-900 p-4 m-auto rounded-lg shadow-lg mx-8 my-4 flex flex-row justify-between">
                        <div className='p-2 pr-10'>
                          <p>Name: {project.name} </p>
                          <p>Version: </p>
                          <p>Date: {project.dateOfCreation.toLocaleDateString()} {project.dateOfCreation.toLocaleTimeString()} </p>
                          {project.tags.length > 0 && (
                            <p>Tags: {project.tags.map((tag, index) => (
                              <span className='rounded-full m-2 p-2 bg-blue-600' key={index}>{tag.tag}</span>
                            ))}</p>
                          )}
                        </div>
                        <div className='content-center'>
                          <button
                            className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                            onClick={() => router.push(`/project/${project.project_id}+${project.name.replace(/ /g, '+')}`)}
                          >
                            View
                          </button>
                          <button
                            className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                            onClick={() => router.push(`/edit-project/${project.project_id}`)}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className='flex justify-center'>
                    <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                      <Skeleton width={600} height={125} count={4} style={{ marginBottom: '16px' }} />
                    </SkeletonTheme>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default withAuth(Home);
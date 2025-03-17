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

//library used for sorting filter: https://www.npmjs.com/package/sort-array
import sortArray from 'sort-array';

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Interfaces
import { Project } from "@/app/shared/interfaces/project";

// Components
import Filters from '@/app/shared/components/filter';
import SigningIn from '@/app/shared/components/signingIn';
import AuthenticatePrompt from '@/app/shared/components/authenticatePrompt';
import ProjectPreview from '@/app/shared/components/projectPreview';
import { User } from './shared/interfaces/user';

interface ProjectTags {
  project_id: number,
  tag: string
}

export interface projectEditors {
  project_id: number,
  email: string,
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
 // const [projectTags, setProjectTags] = useState<ProjectTags[]>([] as ProjectTags[]);
  const [query, setQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');


  useEffect(() => {
    if (query.trim() == '') {
      setFilteredProjects(projects);
    }
    else {
      //display where the search equals the query or matches at least one of the tags
      setFilteredProjects(projects.filter(project => project.name.toLowerCase().includes(query.trim()) || project.tags.some(tag => tag.tag.toLowerCase().includes(query.trim())) || project.editors.some(editor => editor.email?.toLowerCase().includes(query.trim()))));
    }
  }, [query]);
  useEffect(() => {
    // Only runs if the user has logged in
    if (user) {
      // Runs APIs
      const getDatabaseData = async () => {
        // Checks if db exists
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/database/exists`);
        const exists = await response.json();
        if (exists?.DatabaseExists !== 1 || exists.error === "Failed to check database status") {
          setDatabaseErrorMessage("Database not found, contact your system administrator");
        }
        // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
        else if (sessionStorage.getItem('token') != '') {
          // Gets projects that the user has access to
          const fetchProjectData = async () => {
            if (user?.email) {
              const data = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/projects/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
              })
              const tagData = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/projects/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
              })
              const editorData = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/editors/getEditors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
              })

              const result = await data.json() as Project[];
              const tagResult = await tagData.json();
              const editorResult = await editorData.json();

              //sets to newest by default
              const sortedResult = sortArray(result, { by: 'dateOfCreation', order: 'desc' })
              setProjects(sortedResult);
              setFilteredProjects(result);
         //     setProjectTags(tagResult);
              console.log("editorResult:",editorResult);
              
              //assigns tags and editors to projects
              console.log("Tagresult: " + tagResult);
              result.forEach((project: Project) => {
                project.tags = tagResult.filter((tag: ProjectTags) => tag.project_id === project.project_id);
                project.editors = editorResult.filter((user: projectEditors) => user.project_id === project.project_id)
              });

              //assigns editors to project

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
      <AuthenticatePrompt loginErrorMessage={loginErrorMessage} />
    )
  }

  //goes through each UTC date from the database and updates it to display in the current systems timezone
  if (filteredProjects) {
    filteredProjects.forEach((project: Project) => {
      const UTCDate = project.dateOfCreation
      const localTimeDate = new Date(UTCDate); //found how to convert from UTC to system dateTime using this from stackOverflow, post by Hulvej on July 16th 2015: http://stackoverflow.com/questions/6525538/convert-utc-date-time-to-local-date-time - Jacob
      project.dateOfCreation = localTimeDate
    });
  }

  const handleSortBy = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value)
    if (sortBy == "newest") {
      setFilteredProjects(sortArray(filteredProjects, { by: 'dateOfCreation', order: 'asc' })) //made using the sort-array library https://www.npmjs.com/package/sort-array 
    }
    else if (sortBy == "oldest") {
      setFilteredProjects(sortArray(filteredProjects, { by: 'dateOfCreation', order: 'desc' }))
    }
  }

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
                    <ProjectPreview project={project} query={query} />
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
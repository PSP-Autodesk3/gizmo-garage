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

// Library used for sorting filter: https://www.npmjs.com/package/sort-array
import sortArray from 'sort-array';


// Interfaces
import { Project } from "@/app/shared/interfaces/project";
import { ProjectEditors } from "@/app/shared/interfaces/projectEditors";
import { ProjectTags } from "@/app/shared/interfaces/projectTags";

// Components
import Filters from '@/app/shared/components/filter';
import ProjectPreview from '@/app/shared/components/projectPreview';



function Home() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true); // Needs a check once implemented into db as currently this makes everyone admin
  const [databaseErrorMessage, setDatabaseErrorMessage] = useState('');
  const [projects, setProjects] = useState<Project[]>([] as Project[]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([] as Project[]);
  const [query, setQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');


  useEffect(() => {
    if (query.trim() == '') {
      setFilteredProjects(projects);
    }
    else {
      // Display where the search equals the query or matches at least one of the tags
      setFilteredProjects(projects.filter(project => project.name.toLowerCase().includes(query.trim()) ||
        project.tags.some(tag => tag.tag.toLowerCase().includes(query.trim())) ||
        (query.trim().length > 3 &&
          project.editors.some(editor => editor.email?.toLowerCase().includes(query.trim().toLowerCase())))));
    }
  }, [query, projects]);

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

              // Sets to newest by default
              const sortedResult = sortArray(result, { by: 'dateOfCreation', order: 'desc' })
              setProjects(sortedResult);
              setFilteredProjects(result);

              // Assigns tags and editors to projects
              result.forEach((project: Project) => {
                project.tags = tagResult?.filter((tag: ProjectTags) => tag.project_id === project.project_id) || [];
                project.editors = editorResult?.filter((user: ProjectEditors) => user.project_id === project.project_id) || [];
              });

              // Assigns editors to project

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
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Redirects if the user is not logged into their account
    if (!loading && !loadingAuth && !user) {
      router.replace('/landing');
    }
    // Redirects if the user is not authenticated
    if (!sessionStorage.getItem('token') && !loading && !loadingAuth && user) {
      router.replace('/authenticate');
    }
  }, [loadingAuth, router, loading, user]);

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

  // Goes through each UTC date from the database and updates it to display in the current systems timezone
  if (filteredProjects) {
    filteredProjects.forEach((project: Project) => {
      const UTCDate = project.dateOfCreation
      const localTimeDate = new Date(UTCDate); // Found how to convert from UTC to system dateTime using this from stackOverflow, post by Hulvej on July 16th 2015: http://stackoverflow.com/questions/6525538/convert-utc-date-time-to-local-date-time - Jacob
      project.dateOfCreation = localTimeDate
    });
  }

  const handleSortBy = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value)
    if (sortBy == "newest") {
      setFilteredProjects(sortArray(filteredProjects, { by: 'dateOfCreation', order: 'asc' })) // Made using the sort-array library https://www.npmjs.com/package/sort-array 
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
                <h1 className='p-8 text-4xl text-slate-900 dark:text-slate-200 pb-10 font-semibold'>Projects</h1>
                <button
                  className="self-center flex justify-end px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={() => router.push("/new-project")}
                >
                  Create new Project
                </button>
              </div>
              {/* Sort By */}
              <label className='pl-8 text-slate-900 dark:text-slate-200 font-semibold'>Sort By:</label>
              <select onChange={handleSortBy} className='bg-gray-300 dark:bg-slate-900 text-slate-900 dark:text-slate-200 p-1 rounded-lg m-2'>
                <option value="newest" className='text-slate-900 dark:text-slate-200' >Newest</option>
                <option value="oldest" className='text-slate-900 dark:text-slate-200' >Oldest</option>
              </select>
              {/* Loading */}
              {!loadingProjects ? (
                filteredProjects.map((project, index) => (
                  <div className="project" key={index}>
                    <ProjectPreview project={project} query={query} />
                  </div>
                ))
              ) : (
                <div className='space-y-4 ml-10'>
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-gray-300 dark:bg-slate-800 p-4 rounded-lg animate-pulse">
                      <div className='flex justify-between items-center mb-4'>
                        <div className='h-6 bg-gray-400 dark:bg-slate-700 rounded-lg w-2/4'></div>
                      </div>
                      <div className='space-y-3'>
                        <div className='h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-1/4'></div>
                      </div>
                      <div className='flex gap-2 mt-4'>
                        <div className='h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-20'></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default withAuth(Home);
"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback  } from 'react';

//Filter component
import Filters from "../../Filter"

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

interface Folder {
  folder_id: number;
  name: string;
}

interface File {
  object_id: number;
  name: string;
}

function Home({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [project, setProject] = useState('');
  const [routes, setRoutes] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState<string>('');
  const [values, setValues] = useState([20, 80]);
  const [confirmModule, setConfirmModule] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [id, setID] = useState(0);
  const [type, setType] = useState(0);

  const getData = useCallback(async () => {
    const resolved = await params;
    if (resolved) {
      setProject(resolved.slug[0]);
      setRoutes(resolved.slug.slice(1));

      // Get current folder or project ID
      let query = await fetch("/api/getCurrentFileID", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: resolved.slug[0], routes: resolved.slug.slice(1) }),
      });

      let response = await query.json();

      setID(0);
      setType(0);
      if (response[0].folder_id) {
        setID(response[0].folder_id);
      } else {
        setID(response[0].project_id);
        setType(1);
      }

      // Get folders
      query = await fetch("/api/getFolders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      response = await query.json();
      setFolders(response);

      // Get files
      query = await fetch("/api/getObjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      response = await query.json();
      setFiles(response);
    }
  }, [params, id, type]);

  useEffect(() => {
    // This works, but is just testing. These should be reworked into the actual application.

    {/*
    // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
    if (sessionStorage.getItem('token') != '') {
      // Fetches data, needs moving to apis and is temporary for testing
      const fetchData = async () => {
        // POSTs bucket
        let data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "POST",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" },
          body: JSON.stringify({ "bucketKey": "testbucketno1", "policyKey": "persistent" })
        })
        let json = await data.json();
        console.log("Bucket insert:", json);
        
        // GETs all buckets
        data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "GET",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" }
        })
        json = await data.json();
        console.log("Bucket response:", json);
      }
      fetchData();
    }
    */}
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const goneBack = async (num: number) => {
    const selectedFolders = routes.slice(0, (num + 1)).join('/');
    const route = `/project/${project.replace(/%2B/g, '+')}/${selectedFolders.replace(/%2B/g, '+')}`;
    router.push(route);
  }

  const newFolder = async (e: any) => {
    e.preventDefault();

    await fetch("/api/createFolder", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName, project, id, type }),
    });

    getData();
    setConfirmModule(false);
  }

  return (
    <>
      <div className='flex m-auto'>
        <div id='Filter' className='flex'>
          <Filters query={query} onQueryChange={setQuery} values={values} onValuesChange={setValues} />
        </div>
        <div id="data">
          <div id="breadcrumbs" className='flex flex-row'>
            <p>Breadcrumbs:&nbsp;&nbsp;&nbsp;</p>
            <button
              onClick={() => { router.push(`/`); }}
            >
              Home
            </button>
            <p>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</p>
            <button
              onClick={() => { router.push(`/project/${project.replace(/%2B/g, '+')}`); }}
            >
              {project.replace(/%2B/g, ' ')}
            </button>
            {Array.isArray(routes) && routes.length > 0 && (
              routes.map((route, index) => (
                <>
                  <p>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</p>
                  <button
                    key={route}
                    onClick={() => goneBack(index)}
                  >
                    {route.replace(/%2B/g, ' ')}
                  </button>
                </>
              ))
            )}
          </div>
          <div id="folders">
            <h1>Folders</h1>
            {Array.isArray(folders) && folders.length > 0 && (
              folders.map((folder) => (
                <>
                  <div key={folder.folder_id}>
                    <button
                      onClick={() => { router.push(pathname + `/${folder.name.replace(/ /g, '+')}`); }}
                    >
                      {folder.name}
                    </button>
                  </div>
                </>
              ))
            )}
            <button
              onClick={() => setConfirmModule(true)}
            >
              Create New Folder
            </button>
          </div>
          <div id="files">
            <h1>Files</h1>
            {Array.isArray(files) && files.length > 0 && (
              files.map((file) => (
                <>
                  <div key={file.object_id}>
                    <button
                      onClick={() => { }}
                    >
                      {file.name}
                    </button>
                  </div>
                </>
              ))
            )}
            <button>
              Create New Item
            </button>
          </div>
        </div>
        {(confirmModule) && (
          <>
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-slate-900 p-4 w-[40%] h-[40%] m-auto rounded-3xl shadow-lg mt-16">
              <form className="text-center" onSubmit={(e) => newFolder(e)}>
                <h1 className='text-3xl'>Folder name</h1>
                <input
                  name="folder-name"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full mt-4 p-2 rounded-lg"
                  placeholder="Enter folder name"
                />
                <div className="mt-4">
                  <button
                    className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  >
                    Create
                  </button>
                  <button
                    className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    onClick={() => setConfirmModule(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default withAuth(Home);
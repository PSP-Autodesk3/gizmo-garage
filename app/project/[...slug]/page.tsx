"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
 

// Other
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback  } from 'react';
// Auth
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

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
  const [user] = useAuthState(auth);
  const [itemName, setItemName] = useState('');
  const [moduleType, setModuleType] = useState(0); // 1 = Folder, 2 = Item
  const [duplicate, setDuplicate] = useState(0); // 0 = off, 1 = folder, 2 = item

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

  // Create new folder
  const newFolder = async (e: any) => {
    e.preventDefault();
    // Check for duplicates
    const alreadyExists = await fetch("/api/getFolderExists", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: folderName, projectid: project, type, parent_folder_id: id }),
    });
    let resp = await alreadyExists.json();
    if (resp[0].FolderExists === 1) {
      setDuplicate(1);
      setTimeout(() => {
        setDuplicate(0);
      }, 3000);
    } else { // If no duplicates -> create folder
      await fetch("/api/createFolder", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName, project:project.replace(/%2B/g, ' '), id, type }),
      });
      getData();
    }
    setConfirmModule(false);
	  setFolderName("");
  }

  const newItem = async (e: any) => {
    e.preventDefault();
    // Check dupes 
    const alreadyExists = await fetch ("/api/getItemExists", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: itemName, projectid: project, folder_id: id, type }),
    });
    let resp = await alreadyExists.json();
    if (resp[0].ItemExists === 1) {
      setDuplicate(2);
      setTimeout(() => {
        setDuplicate(0);
      }, 3000);
    } else {
      if (user) {
        await fetch("/api/createItem", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemName, email:user.email, project:project.replace(/%2B/g, ' '), id, type }),
        });
      }
    }
    getData();
    setConfirmModule(false);
    setItemName("");
  }

  return (
    <>
	
      <div className='flex m-auto'>
        <div id='Filter'>
          <Filters query={query} onQueryChange={setQuery} values={values} onValuesChange={setValues} />
        </div>
        <div id="data">
            {(!confirmModule) && (
				<div id="breadcrumbs" className="flex flex-row text-2xl p-4 rounded-lg mx-8 my-4">
				<button
				  onClick={() => { router.push(`/`); }}
				>
				  Home
				</button>
				<h1>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</h1>
				<button
				  onClick={() => { router.push(`/project/${project.replace(/%2B/g, '+')}`); }}
				>
				  {project.replace(/%2B/g, ' ')}
				</button>
				{Array.isArray(routes) && routes.length > 0 && (
				  routes.map((route, index) => (
					<>
					  <h1>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</h1>
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
			)}
		{(!confirmModule) && (
          <div className="bg-slate-800 mx-8 my-4 w-full rounded-lg p-4">
            {(duplicate === 1) && (
                <p className="text-red-600">Error: Folder name already exists.</p>
            ) || (duplicate === 2) && (
                <p className="text-red-600">Error: Item name already exists.</p>
            )}
            <div id="folders" className="mx-8 my-4">
              <h1 className="text-3xl my-4">Folders:</h1>
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
              {Array.isArray(folders) && folders.length > 0 && (
                folders.map((folder) => (
                  <>
                    <div key={folder.folder_id}>
                      <button
                        className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                        onClick={() => { router.push(pathname + `/${folder.name.replace(/ /g, '+')}`); }}
                      >
                        {folder.name}
                      </button>
                    </div>
                  </>
                ))
              )}
              
            </div>
			<button
                onClick={() => {setModuleType(1), setConfirmModule(true)}}
				className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
              >
                Create New Folder
              </button>
            <div id="files" className=" my-4">
              <h1 className="my-4 text-3xl">Files</h1>
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
              {Array.isArray(files) && files.length > 0 && (
                files.map((file) => (
                  <>
                    <div key={file.object_id}>
                      <button
                        className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                        onClick={() => { }}
                      >
                        {file.name}
                      </button>
                    </div>
                  </>
                ))
              )}
              </div>
              <button 
			  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
			  onClick={() => {setModuleType(2), setConfirmModule(true)}}
			  >
                Create New Item
              </button>
            </div>
          </div>
          </div>
		)}

        {(confirmModule) && (
          <>
            <div className="fixed inset-0 flex border-indigo-600 border-2 items-center justify-center bg-slate-900 p-4 w-[40%] h-[40%] m-auto rounded-lg shadow-lg mt-16">
              {(moduleType === 1) && (
				<form className="text-center" onSubmit={(e) => newFolder(e)}>
                <h1 className='text-3xl'>Folder name</h1>
                <input
                  name="folder-name"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full mt-4 p-2 rounded-lg bg-slate-800"
                  placeholder="Enter folder name"
				  id="dir-name-input"
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
			  )}
			  {(moduleType === 2) && (
				<form className="text-center" onSubmit={(e) => newItem(e)}>
                <h1 className='text-3xl'>Item name</h1>
                <input
                  name="item-name"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full mt-4 p-2 rounded-lg bg-slate-800"
                  placeholder="Enter Item name"
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
			  )}
            </div>
          </>
        )}
      </div>
      </div>
    </>
  )
}

export default withAuth(Home);
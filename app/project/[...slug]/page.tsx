"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// Firebase
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

// Components
import Filters from "@/app/shared/components/Filter"

// Interfaces
import { ParamProps } from "@/app/shared/interfaces/paramProps";
import { Folder } from "@/app/shared/interfaces/folder";
import { File } from "@/app/shared/interfaces/file";

function Home({ params }: ParamProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [project, setProject] = useState('');
  const [projectID, setProjectID] = useState(0);
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
      setProject(resolved.slug[0].split('%2B').slice(1).join('%2B'));
      setProjectID(Number.parseInt(resolved.slug[0].split('%2B')[0]));
      setRoutes(resolved.slug.slice(1));

      // Get current folder or project ID
      let query = await fetch("/api/getCurrentFileID", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: resolved.slug[0].split('%2B').slice(1).join('%2B'), routes: resolved.slug.slice(1) }),
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

      // GET AND DISPLAY THE TREE STRUCTURE

      // Get folders in the project
      query = await fetch(`/api/getProjectsFolders?projectID=${encodeURIComponent(Number.parseInt(resolved.slug[0].split('%2B')[0]))}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const folders = await query.json();

      // Base information to be passed to outputFolder
      const baseFolders = folders.filter((folder: Folder) => folder.parent_folder_id === null);
      const tree = document.getElementById("trees");
      if (tree) {
        while (tree.firstChild) {
          tree.removeChild(tree.firstChild);
        }
      }

      const outputFolder = (parentFolders: Folder[], parentDetails: HTMLElement, history: string[], depth: number, valid: boolean) => {

        // Iterates foreach child in the folder
        parentFolders.forEach((folder: Folder) => {

          // Tests if the folder is opened
          let newValid = false;
          if (valid) {
            if (routes[depth] === folder.name) {
              newValid = true;
            }
          }

          // Creates a details tag, which by default is collapsible
          const details = document.createElement("details");
          details.className = "pl-6";
          if (newValid)
          details.open = true;

          // Creates a summary tag, which is the preview text
          const summary = document.createElement("summary");
          const button = document.createElement("button");
          button.innerHTML = folder.name;
          summary.appendChild(button);

          // Styling for open folders
          if (newValid) summary.innerHTML = "<strong>" + summary.innerHTML + "</strong>";

          // Assigns the route function
          const newHistory = [...history, `/${folder.name.replace(/ /g, "+")}`];
          const newDepth = depth + 1;

          // Double clicking routes to the folder
          summary.ondblclick = () => {
            const route = `/project/${Number.parseInt(resolved.slug[0].split('%2B')[0])}+${resolved.slug[0].split('%2B').slice(1).join(' ')}${newHistory.join('/')}`;
            console.log(route);
            router.push(route);
          }

          // Adds the new elements to each other and the DOM
          details.appendChild(summary);
          parentDetails.appendChild(details);

          // Gets folders that are a child of the current folder
          const childFolders = folders.filter((childFolder: Folder) => childFolder.parent_folder_id === folder.folder_id);

          // Does this again for each child folder iteratively
          if (childFolders.length > 0) {
            outputFolder(childFolders, details, newHistory, newDepth, newValid);
          }
        })
      }

      if (baseFolders && tree) {
        await outputFolder(baseFolders, tree, [], 0, true);
      }
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
    const route = `/project/${projectID}+${project.replace(/%2B/g, '+')}/${selectedFolders.replace(/%2B/g, '+')}`;
    router.push(route);
  }

  // Create new folder
  const newFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check for duplicates
    const alreadyExists = await fetch("/api/getFolderExists", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: folderName.trim(), projectid: projectID, type, parent_folder_id: id }),
    });
    const resp = await alreadyExists.json();
    if (resp[0].FolderExists === 1) {
      setDuplicate(1);
      setTimeout(() => {
        setDuplicate(0);
      }, 3000);
    } else { // If no duplicates -> create folder
      await fetch("/api/createFolder", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName.trim(), projectid: projectID, folder_id: id, type }),
      });
      getData();
    }
    setConfirmModule(false);
    setFolderName("");
  }

  const newItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check dupes 
    const alreadyExists = await fetch("/api/getItemExists", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: itemName.trim(), projectid: projectID, folder_id: id, type }),
    });
    const resp = await alreadyExists.json();
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
          body: JSON.stringify({ itemName: itemName.trim(), email: user.email, project: projectID, id, type }),
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
        <div>
          <button
            onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
          >
            {project}
          </button>
          <div id="trees"></div>
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
                onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
              >
                {project.replace(/%2B/g, ' ')}
              </button>
              {Array.isArray(routes) && routes.length > 0 && (
                routes.map((route, index) => (
                  <div key={index} className="flex flex-row">
                    <h1>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</h1>
                    <button
                      onClick={() => goneBack(index)}
                    >
                      {route.replace(/%2B/g, ' ')}
                    </button>
                  </div>
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
                      <div key={folder.folder_id}>
                        <button
                          className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                          onClick={() => { router.push(pathname + `/${folder.name.replace(/ /g, '+')}`); }}
                        >
                          {folder.name}
                        </button>
                      </div>
                    ))
                  )}

                </div>
                <button
                  onClick={() => { setModuleType(1); setConfirmModule(true); }}
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
                >
                  Create New Folder
                </button>
                <div id="files" className=" my-4">
                  <h1 className="my-4 text-3xl">Files</h1>
                  <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
                    {Array.isArray(files) && files.length > 0 && (
                      files.map((file) => (
                        <div key={file.object_id}>
                          <button
                            className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                            onClick={() => { }}
                          >
                            {file.name}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
                    onClick={() => { setModuleType(2); setConfirmModule(true); }}
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
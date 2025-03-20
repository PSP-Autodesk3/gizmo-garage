"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// Components
import Filters from "@/app/shared/components/filter"
import FileList from "@/app/shared/components/fileList";
import FolderList from "@/app/shared/components/folderList";
import Breadcrumbs from "@/app/shared/components/breadcrumbs";
import ConfirmModule from "./components/confirmModule";

// Interfaces
import { ParamProps } from "@/app/shared/interfaces/paramProps";
import { Folder } from "@/app/shared/interfaces/folder";
import { File } from "@/app/shared/interfaces/file";
import { Tag } from "@/app/shared/interfaces/tag";

interface ItemTags {
  object_id: number,
  name: string
}

interface FolderTags {
  folder_id: number,
  name: string
}

function Home({ params }: ParamProps) {
  const router = useRouter();
  const [project, setProject] = useState('');
  const [projectID, setProjectID] = useState(0);
  const [routes, setRoutes] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState<string>('');
  const [values, setValues] = useState([20, 80]);
  const [confirmModule, setConfirmModule] = useState(false);
  const [id, setID] = useState(0);
  const [type, setType] = useState(0);
  const [moduleType, setModuleType] = useState(0); // 1 = Folder, 2 = Item
  const [duplicate, setDuplicate] = useState(0); // 0 = off, 1 = folder, 2 = item

  //for tags
  const [alltags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<Folder[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);

  const getData = useCallback(async () => {
    const resolved = await params;
    if (resolved) {
      // Resolves params
      setProject(resolved.slug[0].split('%2B').slice(1).join('%2B'));
      setProjectID(Number.parseInt(resolved.slug[0].split('%2B')[0]));
      setRoutes(resolved.slug.slice(1));

      // Get and display tree structure

      let currentFolder: Folder | null = null as Folder | null;

      const storedFolders = sessionStorage.getItem(`folders_${projectID}`);
      let folderResults: Folder[];

      if (storedFolders) {
        // If folders are in sessionStorage then take them
        folderResults = JSON.parse(storedFolders);
      } else {
        // If not then get them through the API
        const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectID })
        });

        folderResults = await query.json();
        sessionStorage.setItem(`folders_${projectID}`, JSON.stringify(folderResults));
      }

      // Base information to be passed to outputFolder
      const baseFolders = folderResults.filter((folder: Folder) => folder.parent_folder_id === null);
      const tree = document.getElementById("trees");
      if (tree) {
        while (tree.firstChild) {
          tree.removeChild(tree.firstChild);
        }
      }

      // Get Files

      const objectQuery = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number.parseInt(resolved.slug[0].split('%2B')[0]) }),
      });

      const objects = await objectQuery.json();

      const outputFolder = async (parentFolders: Folder[], parentDetails: HTMLElement, history: string[], depth: number, valid: boolean) => {

        // Iterates foreach child in the folder
        parentFolders.forEach((folder: Folder) => {

          // Tests if the folder is opened
          let newValid = false;
          if (valid) {
            if (routes[depth] === folder.name) {
              newValid = true;
              currentFolder = folder;
            }
          }

          // Creates a details tag, which by default is collapsible
          const details = document.createElement("details");
          details.className = "pl-4 mb-1 relative";
          if (newValid) details.open = true;

          // Creates a summary tag, which is the preview text
          const summary = document.createElement("summary");
          summary.className = `flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer mt-1
            ${newValid ? "bg-indigo-500/20 hover:bg-indigo-500/30" : "hover:bg-slate-700/50"}
            transition-all duration-200 relative`; // Using tailwindcss conditional styling, basically if newValid is true, use the first set of classes, otherwise use the second set 

          // Create folder icon and changing its colour dependending on if it is open or not
          const icon = document.createElement("span");
          icon.innerHTML = details.open ? "▼" : "►";

          // Create folder button
          const button = document.createElement("button");
          button.className = `${newValid ? 'text-indigo-200 font-medium' : 'text-slate-300'} 
            hover:text-slate-100 transition-colors duration-200 flex-1 text-left`;
          button.textContent = folder.name;

          // Double clicking routes to the folder
          button.onclick = () => {
            const route = `/project/${projectID}+${project}${newHistory.join('/')}`;
            router.push(route);
          }

          let foldersObjects = objects.filter((object: File) => object.folder_id === folder.folder_id );
          
          foldersObjects.forEach((object: File) => {
            const file = document.createElement("p");
            file.innerHTML = object.name;
            file.className = `ml-[30px] hidden tree-file`;
            details.appendChild(file);
          });

          summary.appendChild(icon);
          summary.appendChild(button);

          // Styling for open folders, commented this out for now, as it was causing svg of open folders to push the text onto a new line
          // if (newValid) summary.innerHTML = "<strong>" + summary.innerHTML + "</strong>"; 

          // Assigns the route function
          const newHistory = [...history, `/${folder.name.replace(/ /g, "+")}`];
          const newDepth = depth + 1;

          // Flips the symbol if open/closed

          details.addEventListener("toggle", () => {
            icon.textContent = details.open ? "▼" : "►";
          })

          // Adds the new elements to each other and the DOM
          details.appendChild(summary);
          parentDetails.appendChild(details);

          // Gets folders that are a child of the current folder
          const childFolders = folderResults.filter((childFolder: Folder) => childFolder.parent_folder_id === folder.folder_id);

          // Does this again for each child folder iteratively
          if (childFolders.length > 0) {
            outputFolder(childFolders, details, newHistory, newDepth, newValid);
          }
        })
      }

      if (baseFolders && tree) {
        await outputFolder(baseFolders, tree, [], 0, true);
      }

      console.log(currentFolder);
      
      setFiles(objects.filter((object: File) => 
        currentFolder === undefined || currentFolder === null ? object.folder_id === null : object.folder_id === currentFolder.folder_id
      ))
      setFilteredFiles(objects.filter((object: File) => 
        currentFolder === undefined || currentFolder === null ? object.folder_id === null : object.folder_id === currentFolder.folder_id
      ))

      /*
      setFilteredFiles(objects.filter((object: File) => {
        currentFolder !== undefined && currentFolder !== null ? object.folder_id = currentFolder.folder_id : object.folder_id === null
      }))
        */

      if (storedFolders) {
        const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectID })
        });

        folderResults = await query.json();
        sessionStorage.setItem(`folders_${projectID}`, JSON.stringify(folderResults));
      }

      // Set Folders

      setID(currentFolder ? (currentFolder.folder_id) : (projectID));
      setType(currentFolder ? (0) : (1));

      if (currentFolder) {
        setFolders(folderResults.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
        setFilteredFolders(folderResults.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
      } else {
        setFolders(folderResults.filter((folder: Folder) => folder.parent_folder_id === null));
        setFilteredFolders(folderResults.filter((folder: Folder) => folder.parent_folder_id === null));
      }

      // Get Tags

      // All Tags
      const getTagsQuery = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const tagResponse = await getTagsQuery.json();
      setTags(tagResponse);
      setFilteredTags(tagResponse);

      // Object Tags
      const objectTagsQuery = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/getObject`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const objectTags = await objectTagsQuery.json();

      // Adds tags to folders
      const folderTagsQuery = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/getFolder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectid: projectID }),
      })

      const folderTags = await folderTagsQuery.json();

      folderResults.forEach((folder: Folder) => {
        folder.tags = folderTags.filter((tag: FolderTags) => tag.folder_id === folder.folder_id);
      });

      // Adds tags to files
      objects.forEach((file: File) => {
        file.tags = objectTags.filter((tag: ItemTags) => tag.object_id === file.object_id);
      });

      const checkbox = document.getElementById('file-checkbox');
      if (checkbox)
        checkbox.addEventListener('change', () => {
          const treeFiles = document.getElementsByClassName("tree-file");
          if (treeFiles[0].classList.contains("hidden")) {
            Array.from(treeFiles).forEach((file) => {
              file.classList.remove('hidden');
            });
          } else {
            Array.from(treeFiles).forEach((file) => {
              file.classList.add('hidden');
            });
          }
        })
    }
  }, [params, id, type]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (query.trim() == '') {
      setFilteredFolders(folders);
      setFilteredFiles(files);
    }
    else {
      setFilteredFolders(folders.filter(folder => folder.name.toLowerCase().includes(query.trim()) || folder.tags.some(tag => tag.tag.toLowerCase().includes(query.trim()))));
      setFilteredFiles(files.filter(file => file.name.toLowerCase().includes(query.trim()) || file.tags.some(tag => tag.tag.toLowerCase().includes(query.trim()))));
    }
  }, [query])

  return (
    <>
      <div className='flex m-auto'>
        {/* Filters */}
        <div id='Filter'>
          <Filters query={query} onQueryChange={setQuery} values={values} onValuesChange={setValues} />
        </div>

        {/* Folder tree */}
        <div id="tree-folders" className="min-w-[280px] flex-shrink-0 mt-[80px]">
          <div className="bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50">
              <button
                className="w-full text-left px-3 py-2 rounded-md bg-slate-700/30 hover:bg-slate-700/50 
                                  transition-all duration-200 text-slate-200 font-medium flex items-center gap-2 shadow-sm hover:shadow"
                onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
              >
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {project.replace(/%2B/g, ' ')}
              </button>
              <div className="flex flex-row ml-[30px] mt-[20px] gap-[15px]">
                <input
                  id="file-checkbox"
                  type="checkbox"
                />
                <p>Show files</p>
              </div>
            </div>
            <div id="trees" className="p-3 space-y-0.5"></div>
          </div>
        </div>

        {/* Folders and files */}
        <div id="data" className="flex-1 max-w-[calc(100%-280px-16rem)]">
          <Breadcrumbs
            projectID={projectID}
            project={project}
            routes={routes}
          />
          {(!confirmModule) && (
            <div className="bg-slate-800 mx-8 my-4 rounded-lg p-4">

              {/* Error message for duplicates */}
              <p className="text-red-600">
                {(duplicate === 1) && (
                  "Error: Folder name already exists."
                ) || (duplicate === 2) && (
                  "Error: Item name already exists."
                )}
              </p>

              {/* Folders */}
              <div id="folders" className="mx-8 my-4">
                <h1 className="text-3xl my-4">Folders:</h1>
                <FolderList
                  folders={filteredFolders}
                />
                <button
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
                  onClick={() => {
                    setModuleType(1);
                    setConfirmModule(true);
                  }}
                >
                  Create New Folder
                </button>
              </div>

              {/* Files */}
              <div id="files" className="mx-8 my-4">
                <h1 className="my-4 text-3xl">Files</h1>
                <FileList
                  files={filteredFiles}
                />
                <button
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center"
                  onClick={() => {
                    setModuleType(2);
                    setConfirmModule(true);
                  }}
                >
                  Create New Item
                </button>
              </div>
            </div>
          )}

          {/* Confirmation for creating new items */}
          {(confirmModule) && (
            <div className="fixed inset-0 flex border-indigo-600 border-2 items-center justify-center bg-slate-900 p-4 w-[40%] h-[40%] m-auto rounded-lg shadow-lg mt-16">
              <ConfirmModule
                itemType={(moduleType === 1 ? "Folder" : "File")}
                projectID={projectID}
                type={type}
                id={id}
                setConfirmModule={setConfirmModule}
                setDuplicate={setDuplicate}
                getData={getData}
                filteredTags={filteredTags}
                allTags={alltags}
                setFilteredTags={setFilteredTags}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default withAuth(Home);
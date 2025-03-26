"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// Sort by
import sortArray from 'sort-array';

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
import { FolderTags } from "@/app/shared/interfaces/folderTags";
import { ItemTags } from "@/app/shared/interfaces/itemTags";

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
  const [folderSortBy, setFolderSortBy] = useState('newest');
  const [fileSortBy, setFileSortBy] = useState('newest');

  // For tags
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
      setRoutes((prevRoutes) => {
        const newRoutes = resolved.slug.slice(1).map(decodeURIComponent);
        return prevRoutes.length === newRoutes.length
          && prevRoutes.every((route, index) => route === newRoutes[index])
          ? prevRoutes : newRoutes;
      });
      

      async function getFolders(): Promise<Folder[]> {
        const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectID })
        });

        return await query.json();
      }
      async function getFiles(): Promise<File[]>  {
        const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectID })
        });

        return await query.json();
      }

      const checkboxOpen = sessionStorage.getItem('checkboxOpen') || 'false';

      let currentFolder: Folder | null = null as Folder | null;

      async function displayTree(folders: Folder[], files: File[]) {
        const tree = document.getElementById("trees");
        if (tree) {
          while (tree.firstChild) {
            tree.removeChild(tree.firstChild);
          }
        }

        const outputFolder = async (folderID: number | null, parentObject: HTMLElement, valid: boolean, depth: number, history: string[]) => {
          const baseFiles = files.filter((file: File) => file.folder_id === folderID);

          baseFiles.forEach((file: File) => {
            const button = document.createElement("button");
            button.className = `pl-4 flex items-center gap-2 py-2 px-3 text-slate-900 dark:text-slate-300 hover:text-slate-500 dark:hover:text-slate-50 transition-colors duration-200 flex-1 text-left tree-file
                              ${checkboxOpen === 'false' && 'hidden'}`;
                              button.innerHTML = `
              <svg class="ml-2 w-5 h-5 text-slate-900 dark:text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              ${file.name}`;
              button.onclick = () => {
                const route = `/item/${file.object_id}`;
                router.push(route);
              }
            parentObject.appendChild(button);
          })

          const baseFolders = folders.filter((folder: Folder) => folder.parent_folder_id === folderID);

          baseFolders.forEach((folder: Folder) => {
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
              ${newValid ? "bg-indigo-400/50 hover:bg-indigo-500/50 dark:bg-indigo-600/50 hover:dark:bg-indigo-400/50" : "hover:bg-indigo-400/50 hover:dark:bg-indigo-400/50"}
              transition-all duration-200 relative`; // Using tailwindcss conditional styling, basically if newValid is true, use the first set of classes, otherwise use the second set 

            // Create folder icon and changing its colour dependending on if it is open or not
            const icon = document.createElement("span");
            icon.innerHTML = details.open ? "▼" : "►";

            // Create folder button
            const button = document.createElement("button");
            button.className = `${newValid ? 'text-indigo-800 dark:text-indigo-200 font-medium' : 'text-slate-900 dark:text-slate-200'} 
              hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-200 flex-1 text-left`;
            button.textContent = folder.name;

            const newHistory = [...history, `/${encodeURIComponent(folder.name)}`];
            const newDepth = depth + 1;

            // Clicking routes to the folder
            button.onclick = () => {
              const route = `/project/${projectID}+${project}${newHistory.join('/')}`;
              router.push(route);
            }

            details.addEventListener("toggle", () => {
              icon.textContent = details.open ? "▼" : "►";
            })

            summary.appendChild(icon);
            summary.appendChild(button);
            details.appendChild(summary);
            parentObject.appendChild(details);
            
            outputFolder(folder.folder_id, details, newValid, newDepth, newHistory);
          })
        }

        if (tree)
          outputFolder(null, tree, true, 0, []);
      }

      // Get stored data
      const storedFolders = sessionStorage.getItem(`folders_${projectID}`);
      const storedFiles = sessionStorage.getItem(`files_${projectID}`);
      
      // Load stored folders
      let folders: Folder[];
      if (storedFolders) {
        folders = JSON.parse(storedFolders);
      } else {
        folders = await getFolders();
        sessionStorage.setItem(`folders_${projectID}`, JSON.stringify(folders));
      }

      // Load stored files
      let files: File[];
      if (storedFiles) {
        files = JSON.parse(storedFiles);
      } else {
        files = await getFiles();
        sessionStorage.setItem(`files_${projectID}`, JSON.stringify(files));
      }

      displayTree(folders, files);

      let newFolders = folders;
      if (storedFolders) {
        newFolders = await getFolders();
        sessionStorage.setItem(`folders_${projectID}`, JSON.stringify(newFolders));
      }
      let newFiles = files;
      if (storedFiles) {
        newFiles = await getFiles();
        sessionStorage.setItem(`files_${projectID}`, JSON.stringify(files));
      }
      if (folders != newFolders || files != newFiles) {
        displayTree(newFolders, newFiles);
      }

      if (currentFolder) {
        setFiles(newFiles.filter((file: File) => file.folder_id === currentFolder?.folder_id))
        setFilteredFiles(newFiles.filter((file: File) => file.folder_id === currentFolder?.folder_id))
      } else {
        setFiles(newFiles.filter((file: File) => file.folder_id === null))
        setFilteredFiles(newFiles.filter((file: File) => file.folder_id === null))
      }

      setID(currentFolder ? (currentFolder.folder_id) : (projectID));
      setType(currentFolder ? (0) : (1));

      if (currentFolder) {
        setFolders(newFolders.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
        setFilteredFolders(newFolders.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
      } else {
        setFolders(newFolders.filter((folder: Folder) => folder.parent_folder_id === null));
        setFilteredFolders(newFolders.filter((folder: Folder) => folder.parent_folder_id === null));
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

      folders.forEach((folder: Folder) => {
        folder.tags = folderTags.filter((tag: FolderTags) => tag.folder_id === folder.folder_id);
      });

      // Adds tags to files
      files.forEach((file: File) => {
        file.tags = objectTags.filter((tag: ItemTags) => tag.object_id === file.object_id);
      });

      const checkbox = document.getElementById('file-checkbox'); 
      if (checkbox) {
        (checkbox as HTMLInputElement).checked = checkboxOpen === 'true'; // Docs on HTMLInputElement https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#instance_properties_that_apply_only_to_elements_of_type_checkbox_or_radio
        checkbox.addEventListener('change', () => {
          const treeFiles = document.getElementsByClassName("tree-file");
          if ((checkbox as HTMLInputElement).checked) {
            Array.from(treeFiles).forEach((file) => {
              file.classList.remove('hidden');
            });
            sessionStorage.setItem('checkboxOpen', 'true');
          } else {
            Array.from(treeFiles).forEach((file) => {
              file.classList.add('hidden');
            });
            sessionStorage.setItem('checkboxOpen', 'false');
          }
        });
      }
    }
  }, [params, router, project, projectID, routes, id, type]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (query.trim() == '') {
      setFilteredFolders(folders);
      setFilteredFiles(files);
    }
    else {
      setFilteredFolders(folders.filter(folder => folder.name.toLowerCase().includes(query.trim())
        || folder.tags.some(tag => tag.tag.toLowerCase().includes(query.trim()))));

      setFilteredFiles(files.filter(file => file.name.toLowerCase().includes(query.trim())
        || file.tags.some(tag => tag.tag.toLowerCase().includes(query.trim()))));
    }
  }, [query, files, folders])

  // Handling sort by
  const handleFolderSortBy = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFolderSortBy(event.target.value);
    if (folderSortBy == "newest") {
      // Sort filteredfolders newest first
      setFilteredFolders(sortArray(filteredFolders, { by: 'dateOfCreation', order: 'asc' }))
    }
    else if (folderSortBy == "oldest") {
      // Sort filteredfolders oldest first
      setFilteredFolders(sortArray(filteredFolders, { by: 'dateOfCreation', order: 'desc' }))
    }
  }

  const handleFileSortBy = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFileSortBy(event.target.value)
    if (fileSortBy == "newest") {
      setFilteredFiles(sortArray(filteredFiles, { by: 'dateOfCreation', order: 'asc' }))
    }
    else if (fileSortBy == "oldest") {
      // Sort filteredfolders oldest first
      setFilteredFiles(sortArray(filteredFiles, { by: 'dateOfCreation', order: 'desc' }))
    }
  }


  // Goes through each UTC date from the database and updates it to display in the current systems timezone
  if (filteredFiles) {
    filteredFiles.forEach((file: File) => {
      const UTCDate = file.dateOfCreation
      const localTimeDate = new Date(UTCDate);
      file.dateOfCreation = localTimeDate
    });
  }

  if (filteredFolders) {
    filteredFolders.forEach((Folder: Folder) => {
      const UTCDate = Folder.dateOfCreation
      const localTimeDate = new Date(UTCDate);
      Folder.dateOfCreation = localTimeDate
    });
  }

  return (
    <>
      <div className='flex m-auto'>
        {/* Filters */}
        <div id='Filter'>
          <Filters query={query} onQueryChange={setQuery} values={values} onValuesChange={setValues} />
        </div>

        {/* Folder tree */}
        <div id="tree-folders" className="min-w-[280px] flex-shrink-0 mt-[80px]">
          <div className="bg-indigo-200/50 dark:bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden border border-slate-700/50 text-slate-900 dark:text-slate-200">
            <div className="p-4 border-b border-slate-700/50">
              <button
                className="w-full text-left px-3 py-2 bg-indigo-400/50 dark:bg-indigo-600/50 hover:bg-indigo-400/50 hover:dark:bg-indigo-400/50 
                                  transition-all duration-200 rounded-md text-slate-900 dark:text-slate-200 font-medium flex items-center gap-2 shadow-sm hover:shadow"
                onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
              >
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {project.replace(/%2B/g, ' ')}
              </button>
              <div className="flex flex-row mt-[20px] gap-[7.5px]">
              <input
                id="file-checkbox"
                type="checkbox"
                defaultChecked={sessionStorage.getItem('checkboxOpen') === 'true'}
                className={`m-1 w-4 h-4 checked:bg-green-600 checked:border-green-600 bg-red-600 border-red-600 border-2 appearance-none rounded transition-colors duration-200`}
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
            <div className="bg-indigo-200/50 dark:bg-slate-800/50 w-[90%] mx-auto rounded-lg border border-slate-700/50 mt-4">

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
                <div className="flex flex-row justify-between">
                  <h1 className="text-3xl my-4 text-slate-900 dark:text-slate-200 font-semibold">Folders:</h1>
                  <div className="content-center">
                    {/* Sort By */}
                    <label className="pl-8 text-slate-900 dark:text-slate-200 font-semibold">Sort By:</label>
                    <select onChange={handleFolderSortBy} className='bg-indigo-200/50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 p-1 rounded-lg m-2'>
                      <option value="newest" className='text-slate-900 dark:text-slate-200'>Newest</option>
                      <option value="oldest" className='text-slate-900 dark:text-slate-200'>Oldest</option>
                    </select>
                  </div>
                </div>
                <FolderList
                  folders={filteredFolders}
                />
                <button
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300
                   hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center ml-auto"
                  onClick={() => {
                    setModuleType(1);
                    setConfirmModule(true);
                  }}
                >
                  Create New Folder
                </button>
              </div>

              <div className="p border-b border-slate-700/50"></div>

              {/* Files */}
              <div id="files" className="mx-8 my-4">
                <div className='flex flex-row justify-between'>
                  <h1 className="my-4 text-3xl text-slate-900 dark:text-slate-200 font-semibold">Files:</h1>
                  <div className="content-center">
                    {/* Sort By */}
                    <label className="pl-8 text-slate-900 dark:text-slate-200 font-semibold">Sort By:</label>
                    <select onChange={handleFileSortBy} className='bg-indigo-200/50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 p-1 rounded-lg m-2'>
                      <option value="newest" className='text-slate-900 dark:text-slate-200'>Newest</option>
                      <option value="oldest" className='text-slate-900 dark:text-slate-200'>Oldest</option>
                    </select>
                  </div>
                </div>
                <FileList
                  files={filteredFiles}
                />
                <button
                  className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center ml-auto"
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
            <div className="fixed inset-0 flex border-slate-700/50 border items-center justify-center bg-indigo-200 dark:bg-slate-900 text-slate-900 dark:text-slate-200 w-[40%] h-[50%] m-auto rounded-lg mt-16">
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
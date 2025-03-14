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
  const [folderSortBy, setFolderSortBy] = useState('newest');
  const [fileSortBy, setFileSortBy] = useState('newest');

  //for tags
  const [alltags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<Folder[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);

  const sortArray = require('sort-array');

  const getData = useCallback(async () => {
    const resolved = await params;
    if (resolved) {
      // Resolves params
      setProject(resolved.slug[0].split('%2B').slice(1).join('%2B'));
      setProjectID(Number.parseInt(resolved.slug[0].split('%2B')[0]));
      setRoutes(resolved.slug.slice(1));

      // Get and display tree structure

      let currentFolder: Folder | null = null as Folder | null;

      // Get folders in the project
      const query = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectID })
      })

      
      const folders = await query.json();

      //defaults it to newest first
      const sortedFolders =  sortArray(folders, { by: 'dateOfCreation', order: 'desc' })
      setFolders(sortedFolders);
      setFilteredFolders(sortedFolders);

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
              currentFolder = folder;
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
            const route = `/project/${projectID}+${project}${newHistory.join('/')}`;
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

      // Get Folders

      setID(currentFolder ? (currentFolder.folder_id) : (projectID));
      setType(currentFolder ? (0) : (1));

      if (currentFolder) {
        setFolders(folders.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
        setFilteredFolders(folders.filter((folder: Folder) => folder.parent_folder_id === currentFolder?.folder_id));
      } else {
        setFolders(folders.filter((folder: Folder) => folder.parent_folder_id === null));
        setFilteredFolders(folders.filter((folder: Folder) => folder.parent_folder_id === null));
      }

      // Get Files

      const objectQuery = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      const objects = await objectQuery.json();
      const sortedObjects =  sortArray(objects, { by: 'dateOfCreation', order: 'desc' })
      setFiles(sortedObjects);
      setFilteredFiles(sortedObjects);

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
      objects.forEach((file: File) => {
        file.tags = objectTags.filter((tag: ItemTags) => tag.object_id === file.object_id);
      });
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

  //handling sort by
  const handleFolderSortBy = (event: any) => {
    setFolderSortBy(event.target.value);
    if (folderSortBy == "newest") {
      //sort filteredfolders newest first
      setFilteredFolders(sortArray(filteredFolders, { by: 'dateOfCreation', order: 'asc' }))
    }
    else if (folderSortBy == "oldest") {
      //sort filteredfolders oldest first
      setFilteredFolders(sortArray(filteredFolders, { by: 'dateOfCreation', order: 'desc' }))
    }
  }

  const handleFileSortBy = (event: any) => {
    setFileSortBy(event.target.value)
    if (fileSortBy == "newest") {
      setFilteredFiles(sortArray(filteredFiles, { by: 'dateOfCreation', order: 'asc' }))
    }
    else if (fileSortBy == "oldest") {
      //sort filteredfolders oldest first
      setFilteredFiles(sortArray(filteredFiles, { by: 'dateOfCreation', order: 'desc' }))
    }
  }


  //goes through each UTC date from the database and updates it to display in the current systems timezone
  if (filteredFiles) {
    filteredFiles.forEach((file: File) => {
      var UTCDate = file.dateOfCreation
      var localTimeDate = new Date(UTCDate);
      file.dateOfCreation = localTimeDate
    });
  }
  
  if (filteredFolders) {
    filteredFolders.forEach((Folder: Folder) => {
      var UTCDate = Folder.dateOfCreation
      var localTimeDate = new Date(UTCDate);
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
        <div id="tree-folders">
          <button
            onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
          >
            {project}
          </button>

          {/* Folders are added to this div */}
          <div id="trees"></div>
        </div>

        {/* Folders and files */}
        <div id="data">
          <Breadcrumbs
            projectID={projectID}
            project={project}
            routes={routes}
          />
          {(!confirmModule) && (
            <div className="bg-slate-800 mx-8 my-4 w-full rounded-lg p-4">

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
                <label>Sort By:</label>
                <select onChange={handleFolderSortBy}>
                  <option value="newest" >newest</option>
                  <option value="oldest" >oldest</option>
                </select>
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
                <h1 className="my-4 text-3xl">Files:</h1>
                <label>Sort By:</label>
                <select onChange={handleFileSortBy}>
                  <option value="newest" >newest</option>
                  <option value="oldest" >oldest</option>
                </select>
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
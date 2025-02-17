"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

//Filter component
import Filters from "./Filter"

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
  const admin = useState(true);
  const [project, setProject] = useState('');
  const [routes, setRoutes] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

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

    const fetchData = async () => {
      const resolved = await params;
      if (resolved) {
        setProject(resolved.slug[0]);
        setRoutes(resolved.slug.slice(1));

        let query = await fetch("/api/getCurrentFileID", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: resolved.slug[0], routes: resolved.slug.slice(1) }),
        });

        let response = await query.json();
        console.log("Response", response);

        let id = 0; let type = 0;

        if (response[0].folder_id) {
          console.log("Folder");
          id = response[0].folder_id;
        } else {
          console.log("Project");
          id = response[0].project_id;
          type = 1;
        }

        query = await fetch("/api/getFolders", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, type }),
        })

        response = await query.json();
        setFolders(response);
        console.log("Response", response);

        query = await fetch("/api/getObjects", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, type }),
        })

        response = await query.json();
        setFiles(response);
        console.log("Response", response);
      }
    };

    fetchData();
  }, []);

  const goneBack = async (num: number) => {
    const selectedFolders = routes.slice(0, (num + 1)).join('/');
    const route = `/project/${project.replace(/%2B/g, '+')}/${selectedFolders.replace(/%2B/g, '+')}`;
    router.push(route);
  }

  return (
    <>
      <div className='flex m-auto'>
        <div id='Filter' className='flex'>
          <Filters />
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
            <button>
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
      </div>
    </>
  )
}

export default withAuth(Home);
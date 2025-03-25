"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

//Filter component
import BackBtnBar from "@/app/shared/components/backBtnBar";

// Interfaces
import { ParamProps } from "@/app/shared/interfaces/paramProps";

// Firebase
import { auth } from "@/app/firebase/config";
import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { Folder } from "@/app/shared/interfaces/folder";

function Home({ params }: ParamProps) {
    const router = useRouter();
     const [itemId, setItemId] = useState<number | null>(null);
     const [itemName, setItemName] = useState<string | null>(null);
     const [author, setAuthor] = useState<string | null>(null);
     const [bucketKey, setBucketKey] = useState<string | null>(null);
     const [projectID, setProjectID] = useState<string | null>(null);
     const [folderID, setFolderID] = useState<number | null>(null);
     const [projectName, setProjectName] = useState<string | null>(null);
     // File uploads
     const [file, setFile] = useState<File | null>(null);
     const [uploading, setUploading] = useState<boolean>(false);
     const [message, setMessage] = useState<string | null>(null);
     const [versions, setVersions] = useState<any[]>([]);
     // Password confirmation
     const [confirmModule, setConfirmModule] = useState<boolean>(false);
     const [password, setPassword] = useState<string>('');
     const [rollbackVer, setRollbackVer] = useState<number | null>(null);
     

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };
        const generateLatestVersion = async (bucketKey: string) => {
            try {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/latestVersion`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ bucket_id: bucketKey }),
                });
                const data = await response.json();
                const newVersion = data.version + 1;
                return newVersion;
            }
            catch (error) {
                console.log(error);
                const newVersion = 1;
                return newVersion;
            }
        }

        const fetchVersions = async () => {
            if (bucketKey) {
                const getVersions = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/allVersions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ bucket_id: bucketKey }),
                });
                setVersions(await getVersions.json());
            }
        }

        const tagNewVersion = async (version: number, urn: string, bucketKey: string, objectKey: string) => {
            try {
                await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/tag`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bucket_id: bucketKey, urn: urn, version: version, object_key: objectKey }),
                });
            }
            catch (error) {
                console.log(error);
            }
            fetchVersions();
        }

        const handleUpload = async () => {
        try { 
            if (!file) {
                setMessage("No file selected");
                return;
            }
            setUploading(true);
            setMessage("");
            const formData = new FormData();
            formData.append("file", file);
            const token = sessionStorage.getItem("token");
            if (token) {
                formData.append("token", token);
            }
            if (bucketKey) {
                formData.append("bucketKey", bucketKey);
            }
            try {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/oss/upload`, {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                const urn = data.urn;
                const objectKey = data.objectKey;
                if (data.message === "File uploaded successfully!") {
                    setMessage("File uploaded successfully");
                } else {
                    setMessage("Error uploading file");
                }
                if (bucketKey) {
                    const version = await generateLatestVersion(bucketKey);
                    if (version && urn && bucketKey) {
                        tagNewVersion(version, urn, bucketKey, objectKey);
                    }
                }
            }
            catch (error) {
                setMessage("Error uploading file");
            }
        }
        catch (error) {
            setMessage("Error uploading file");
            console.log(error);
        } finally {
            setUploading(false);
        }
    }

        const downloadFile = async (urn: string, objectKey: string) => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required');
                }
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/oss/download`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, urn }),
                });
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Download failed');
                }
                let filename = objectKey;        
                // Create download link
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);
            } catch (error) {
                console.error('[Download] Error:', error);
            }
        };

        const rollbackVersion = async (version: number, bucketKey: string) => {
            try {
                await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/rollback`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bucket_id: bucketKey, version: version }),
                });
            }
            catch (error) {
                console.log(error);
            }
            fetchVersions();
        }

        const validatePassword = async () => { // Reused felix's code
            const currentUser = auth.currentUser;
            if (!currentUser?.email || !password){
              alert('Please enter your password');
              return;
            }
            try {
              const credential = EmailAuthProvider.credential(
                currentUser.email,
                password
              );
              await reauthenticateWithCredential(currentUser, credential);
              if (rollbackVer && bucketKey) {
                rollbackVersion(rollbackVer, bucketKey);
              }
              setPassword('');
              setConfirmModule(false);
            }
            catch{
              alert('Incorrect password');
            }
          }

     useEffect(() => {
        const resolveParams = async () => {
            const resp = await params;
            setItemId(Number(resp.slug[0]));
        }
        resolveParams();
    }, [params])

    useEffect(() => {
        const fetchInfo = async () => {
            if (itemId !== null) {
                const response = await fetch (`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/info`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId }),
                });
                const itemData = await response.json();
                setItemName(itemData[0]?.name);
                setAuthor(itemData[0]?.fname + " " + itemData[0]?.lname);
                setBucketKey(itemData[0]?.bucket_id);
                setProjectID(itemData[0]?.project_id);
                setProjectName(itemData[0]?.project_name);
                setFolderID(itemData[0]?.folder_id);
            }
        }
        fetchInfo();
    }, [itemId]);

    useEffect(() => {
        fetchVersions();
    }, [bucketKey]);

    const backButton = async () => {
        const details = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projectID })
        });
        const results = await details.json();
        const currentFolder = results.find((folder: Folder) => folder.folder_id === folderID);

        const folders: Folder[] = [];
        if (currentFolder) {
            folders.push(currentFolder);
            let con = false;

            while (!con) {
                const currentFolder = results.find((folder: Folder) => folder.folder_id === folders[folders.length - 1].parent_folder_id);

                if (currentFolder) {
                    folders.push(currentFolder);
                } else {
                    con = true;
                }
            }
        }
        let route = '';
        folders.slice().reverse().map((folder: Folder) => route += `/${folder.name}`);
        if (route === '')
            route = '/'
        
        router.push(`../project/${projectID}+${projectName?.replace(/ /g, '+')}/${route}`);
    }
    
     return (
        <>
        
        <BackBtnBar />
        <div>
            <button
                className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
                           transition-all duration-300 hover:bg-indigo-500 
                           hover:scale-105 shadow-lg hover:shadow-indigo-500/50 ml-8"
                onClick={backButton}
            >
                <svg className="w-6 h-6 text-gray-800 dark:text-white inline-block mr-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14M5 12l4-4m-4 4 4 4"
                    />
                </svg>
                Back
            </button>
        </div>
        <div className={`w-full ${confirmModule ? 'blur-xl bg-opacity-40' : ''}`}>
            <div className="lg:grid lg:grid-cols-2 w-full">
            <div>
                <div className="bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4">
                    <h1 className="text-2xl text-center pb-4">
                        Item Details
                    </h1>
                    <div className="flex flex-col w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                        <p><b>ID:</b> {itemId}</p>
                    </div>
                    <div className="flex flex-col w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                        <p><b>Name:</b> {itemName}</p>
                    </div>
                    <div className="flex flex-col w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-l">
                        <p><b>Author:</b> {author}</p>
                    </div>
                    <div className="flex flex-col w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                        <p><b>Bucket Key:</b> {bucketKey}</p>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4">
            <h1 className="text-2xl text-center pb-4">Tag new version</h1>
                <input type="file" onChange={handleFileChange} className="mb-4 rounded-lg p-4 text-lg" />
                    <br />
                    <button
                        onClick={handleUpload}
                        className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload File"}
                    </button>
                    {message && <p className="mt-2 text-sm">{message}</p>}
            </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4">
                <h1 className="text-2xl text-center pb-4">
                    Versions
                </h1>
                <div className="flex flex-col items-center">
                    {versions.map((version, index) => (
                        <div key={index} className="flex justify-between w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                            <p className="text-2xl p-4">Version: <b>{version.version}</b></p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => downloadFile(version.urn, version.object_key)}
                                    className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => {
                                        if (bucketKey) {
                                            setRollbackVer(version.version);
                                            setConfirmModule(true);
                                        }
                                    }}
                                    className="px-6 m-1 py-3 text-lg font-medium bg-red-500 rounded-lg transition-all duration-300 hover:bg-red-400 hover:scale-105 shadow-lg hover:shadow-red-400/50"
                                >
                                    Rollback
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
            {/*/ Row 2
            <div className="px-8">
                
            </div>
           */}  

        {(confirmModule) && (
            <>
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-95 bg-slate-900 w-[40%] h-[40%] m-auto rounded-3xl shadow-lg p-8">
            <div className="text-center">
              <h1 className='text-3xl'>This will clear all data.</h1> 
              <strong>This action is irreversible.</strong> <p> Your password is needed to complete this action.</p>
              <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <input 
                  className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg" 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                  aria-autocomplete="none"
                />
              </form>
              {/* Buttons */}
              <div className="mt-4">
                <button 
                  className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={() => validatePassword()}
                >
                  Rollback
                </button>
                <button 
                  className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" 
                  onClick={() => {
                    setConfirmModule(false);
                    setPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
            </>   
        )}
        </>
    )
}

export default withAuth(Home);
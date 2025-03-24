"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
 
// Other
import { useState, useEffect } from "react";

//Filter component
import BackBtnBar from "@/app/shared/components/backBtnBar";

interface PageProps {
  params: { slug: string[] };
}

function Home({ params }: PageProps) {
     const [itemId, setItemId] = useState<number | null>(null);
     const [itemName, setItemName] = useState<string | null>(null);
     const [author, setAuthor] = useState<string | null>(null);
     const [bucketKey, setBucketKey] = useState<string | null>(null);
     // File uploads
     const [file, setFile] = useState<File | null>(null);
     const [uploading, setUploading] = useState<boolean>(false);
     const [message, setMessage] = useState<string | null>(null);
     const [versions, setVersions] = useState<any[]>([]);

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

     useEffect(() => {
        const resolveParams = async () => {
            const resp = await params;
            setItemId(Number(resp.slug[0]));
        }
        resolveParams();
     }, [])
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
            }
        }
        fetchInfo();
    }, [itemId]);

    useEffect(() => {
        fetchVersions();
    }, [bucketKey]);
    
     return (
        <>
        <BackBtnBar />
        <div className="w-full">
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
                                    onClick={() => bucketKey && rollbackVersion(version.version, bucketKey)}
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
        </>
     )
}

export default withAuth(Home);
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

        const tagNewVersion = async (version: number, urn: string, bucketKey: string) => {
            try {
                await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/tag`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bucket_id: bucketKey, urn: urn, version: version }),
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
                if (data.message === "File uploaded successfully!") {
                    setMessage("File uploaded successfully");
                } else {
                    setMessage("Error uploading file");
                }
                if (bucketKey) {
                    const version = await generateLatestVersion(bucketKey);
                    if (version && urn && bucketKey) {
                        tagNewVersion(version, urn, bucketKey);
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
        <div className="lg:grid lg:grid-cols-3 w-full p-8">
            {/*/ Row 1 */}
            <div>
                <div className="bg-slate-800 rounded-lg p-4">
                    <h1 className="text-2xl text-center">
                        Item Details
                    </h1>
                    <div className="flex flex-col items-center">
                        <p>ID: {itemId}</p>
                        <p>Name: {itemName}</p>
                        <p>Author: {author}</p>
                        <p>Bucket Key: {bucketKey}</p>
                    </div>
                </div>
            </div>
            {/*/ Row 2 */}
            <div className="px-8">
                <input type="file" onChange={handleFileChange} className="mb-4 bg-slate-800 rounded-lg p-4 text-lg" />
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
            {/*/ Row 3 */}
            <div className="bg-slate-800 rounded-lg p-4">
                <h1 className="text-2xl text-center">
                    Versions
                </h1>
                <div className="flex flex-col items-center">
                    {versions.map((version, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <p>Version: {version.version}</p>
                            <p>URN: {version.urn}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>      
        </>
     )
}

export default withAuth(Home);
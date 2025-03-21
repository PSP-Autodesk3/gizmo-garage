"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
 
// Other
import { useRouter, usePathname } from 'next/navigation';
import { use, useCallback, useState, useEffect } from "react";
// Auth
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

//Filter component
import BackBtnBar from "@/app/shared/components/backBtnBar";

interface PageProps {
  params: { slug: string[] };
}

interface Item {
    object_id: number;
    name: string;
}

function Home({ params }: PageProps) {
     const router = useRouter();
     const [item, setItem] = useState<Item | null>(null);
     const [itemId, setItemId] = useState<number | null>(null);
     const [itemName, setItemName] = useState<string | null>(null);
     const [author, setAuthor] = useState<string | null>(null);
     const [bucketKey, setBucketKey] = useState<string | null>(null);
     // File uploads
     const [file, setFile] = useState<File | null>(null);
     const [uploading, setUploading] = useState<boolean>(false);
     const [message, setMessage] = useState<string | null>(null);

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files.length > 0) {
                setFile(event.target.files[0]);
            }
        };

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
                const response = await fetch("http://localhost:3001/oss/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    setMessage("File uploaded successfully");
                } else {
                    setMessage("Error uploading file");
                }
            }
            catch (error) {
                setMessage("Error uploading file");
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
                const response = await fetch ("http://localhost:3001/items/info", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId }),
                });
                const itemData = await response.json();
                console.log(itemData);
                setItemName(itemData[0]?.name);
                setAuthor(itemData[0]?.fname + " " + itemData[0]?.lname);
                setBucketKey(itemData[0]?.bucket_id);
            }
        }
        fetchInfo();
    }, [itemId]);
    
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
        </div>      
        </>
     )
}

export default withAuth(Home);
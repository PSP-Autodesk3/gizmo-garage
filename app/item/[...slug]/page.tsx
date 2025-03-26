"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import Head from 'next/head';

//Filter component
import BackBtnBar from "@/app/shared/components/backBtnBar";

// Interfaces
import { ParamProps } from "@/app/shared/interfaces/paramProps";

// Firebase
import { auth } from "@/app/firebase/config";
import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useAuthState } from 'react-firebase-hooks/auth';

function Home({ params }: ParamProps) {
    const [itemId, setItemId] = useState<number | null>(null);
    const [itemName, setItemName] = useState<string | null>(null);
    const [author, setAuthor] = useState<string | null>(null);
    const [bucketKey, setBucketKey] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [versions, setVersions] = useState<any[]>([]);
    const [confirmModule, setConfirmModule] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [rollbackVer, setRollbackVer] = useState<number | null>(null);
    const [viewerState, setViewerState] = useState<Boolean>(false);
    const [itemTranslating, setItemTranslating] = useState(false);
    const [archiveStatus, setArchiveStatus] = useState<boolean>(false);
    const [projectID, setProjectID] = useState<string | null>(null);
    const [folderID, setFolderID] = useState<number | null>(null);
    const [projectName, setProjectName] = useState<string | null>(null);
    const [projectOwner, setProjectOwner] = useState<string | null>(null);
    const [user, loadingAuth] = useAuthState(auth);

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

    const fetchVersions = useCallback(async () => {
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
    }, [bucketKey])

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
                console.log("data", data);
                const urn = data.urn;
                const objectKey = data.objectKey;
                if (data.message === "File uploaded successfully!") {
                    setMessage("File uploaded successfully");

                    await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                                'x-ads-force': 'true'
                            },
                            body: JSON.stringify({
                                "input": {
                                    urn: btoa(urn)
                                },
                                "output": {
                                    "formats": [
                                        {
                                            "type": "svf2",
                                            "views": [
                                                "2d",
                                                "3d"
                                            ]
                                        }
                                    ]
                                }
                            })
                        }
                    )
                } else if (data.message.startsWith("Not allowed file type:")) {
                    setMessage(data.message + data.extension);
                }else {
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
        if (!currentUser?.email || !password) {
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
        
        
    const archiveItem = async (action: string) => {
        try {
            if (action === "archive") {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/archive`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId, action: "archive" })
                });
                const data = await response.json();
                if (data.message === "Item archived") {
                    setArchiveStatus(true);
                }
            } else if (action === "unarchive") {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/archive`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId, action: "unarchive" })
                });
                const data = await response.json();
                if (data.message === "Item unarchived") {
                    setArchiveStatus(false);
                }
            }
            
        }
        catch (error) {
            console.log(error);
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
            if (itemId !== null && !loadingAuth) {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/items/info`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId }),
                });
                const itemData = await response.json();
                console.log("Data:", itemData);
                setItemName(itemData[0]?.name);
                setAuthor(itemData[0]?.fname + " " + itemData[0]?.lname);
                setBucketKey(itemData[0]?.bucket_id);
                setProjectID(itemData[0]?.project_id);
                setProjectName(itemData[0]?.project_name);
                setFolderID(itemData[0]?.folder_id);
                setProjectOwner(itemData[0]?.owner.toLowerCase());
                if (itemData[0]?.archived === 1) {
                    setArchiveStatus(true);
                } else {
                    setArchiveStatus(false);
                }
            }
        }
        fetchInfo();
    }, [itemId, loadingAuth]);

    useEffect(() => {
        fetchVersions();
    }, [bucketKey, fetchVersions]);

    const viewSDK = async () => {
        setViewerState(!viewerState);
    }

    const viewerSDK = async (urn: string) => { // Used docs for viewerSDK setup: https://aps.autodesk.com/en/docs/viewer/v7/developers_guide/viewer_basics/starting-html/
        const token = sessionStorage.getItem("token");
        viewSDK()
        const returnedUrn = btoa(urn).slice(0, -1);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const getManifest = async () => {
            // Gets status of svf conversion
            let query = await fetch(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${returnedUrn}/manifest`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            let response = await query.json();
            console.log("Manifest response:", JSON.stringify(response, null, 2));

            if (response.status === 'success') {
                // Returns true if the svf is converted
                return true;
            }
            return false;
        }

        let loop = true;
        // Checks svf status and timesout after 10 attempts
        for (let iteration = 0; iteration < 10 && loop; iteration++) {
            const found = await getManifest();
            if (found) {
                setItemTranslating(false);
                loop = false;
            } else {
                setItemTranslating(true);
                await delay(5000);
            }
        }

        // Returns if it wasn't successful
        if (loop) {
            alert("Failed to retrieve the file");
            return;
        }

        let viewer: Autodesk.Viewing.GuiViewer3D;
        var options = {
            env: 'AutodeskProduction',
            api: 'streamingV2',
            getAccessToken: function (onTokenReady: any) {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    console.error("No valid token found.");
                    return;
                }
                var timeInSeconds = 3600;
                onTokenReady(token, timeInSeconds);
            }
        };
        if (urn.length > 0) {
            // Initialises the viewer
            Autodesk.Viewing.Initializer(options, function () {
                const htmlDiv = document.getElementById('forgeViewer');
                if (htmlDiv) {
                    viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, {});
                }
                console.log("urn:" + btoa(returnedUrn));
                // Start the viewer
                viewer.start();

                const backButton = document.getElementById('viewerBackButton');
                backButton?.addEventListener('click', () => {
                    viewer.finish();
                })
                // Load the object into the document
                Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
            });

            const documentId = "urn:" + returnedUrn;

            function onDocumentLoadSuccess(viewerDocument: any) {
                const defaultViewable = viewerDocument.getRoot().getDefaultGeometry();
                // Load the svf item into the viewer
                viewer.loadDocumentNode(viewerDocument, defaultViewable);
            }

            function onDocumentLoadFailure() {
                console.error('Failed fetching Forge manifest');
            }
        }
    }

    return (
        <>
            <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css" type="text/css"></link>
            <Script onLoad={() => { console.log("loaded SDK") }} defer src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js"></Script>

            <div className={`w-full ${viewerState ? 'blur-xl bg-opacity-40' : ''}`}>
                <div className={`${viewerState ? 'pointer-events-none' : ''}`}>
                    <BackBtnBar back={true} projectID={projectID} folderID={folderID} projectName={projectName} />
                </div>
                {archiveStatus && (
                    <div className="bg-amber-400 text-black border border-amber-600/50 font-bold text-2xl rounded-lg text-center p-4 mx-8">
                        <p>This item has been archived.</p>
                    </div>
                )}
                <div className="lg:grid lg:grid-cols-2 w-full">
                    <div>
                        <div className="bg-indigo-200 text-slate-800 dark:text-white dark:bg-slate-800/50 backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4">
                            <h1 className="text-2xl text-center pb-4">
                                Item Details
                            </h1>
                            <div className="flex flex-col bg-indigo-100/50 dark:bg-slate-800/50 w-full border px-2 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                                <p><b>ID:</b> {itemId}</p>
                            </div>
                            <div className="flex flex-col w-full border px-2 bg-indigo-100/50 dark:bg-slate-800/50 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                                <p><b>Name:</b> {itemName}</p>
                            </div>
                            <div className="flex flex-col w-full border px-2 bg-indigo-100/50 dark:bg-slate-800/50 border-slate-700/50 py-2 my-2 rounded-lg text-l">
                                <p><b>Author:</b> {author}</p>
                            </div>
                            <div className="flex flex-col w-full border px-2 bg-indigo-100/50 dark:bg-slate-800/50 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                                <p><b>Bucket Key:</b> {bucketKey}</p>
                            </div>
                            {projectOwner === user?.email?.toLowerCase() && (
                            <>
                                <button
                                onClick={async () => await archiveItem(archiveStatus ? "unarchive" : "archive")}
                                className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg text-white transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                                disabled={uploading}
                            >
                                {archiveStatus ? "Unarchive" : "Archive"}
                            </button>
                            </>   
                            )}
                        </div>
                    </div>
                    <div className={`bg-indigo-200 dark:bg-slate-800/50 dark:text-white text-slate-800 backdrop-blur mx-8 my-4 transition-all duration-300 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4 ${archiveStatus ? 'opacity-40 pointer-events-none' : ''}`}>
                        <h1 className="text-2xl text-center pb-4">Tag new version</h1>
                            <input type="file" onChange={handleFileChange} className="mb-4 rounded-lg p-4 text-lg" />
                            <br />
                            <button
                                onClick={handleUpload}
                                className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 text-white"
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        {message && <p className="mt-2 text-sm">{message}</p>}
                    </div>
                </div>
                <div className="bg-indigo-200 dark:bg-slate-800/50 text-slate-800 dark:text-white backdrop-blur mx-8 my-4 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 p-4">
                <h1 className="text-2xl text-center pb-4">
                    Versions
                </h1>
                <div className="flex flex-col items-center">
                    {versions.map((version, index) => (
                        <div key={index} className="flex justify-between w-full border px-2 bg-indigo-100/50 dark:bg-slate-800/50 border-slate-700/50 py-2 my-2 rounded-lg text-lg">
                            <p className="text-2xl p-4">Version: <b>{version.version}</b></p>
                            <div className="flex justify-center">
                                <button
                                    className={`px-6 m-1 py-3 text-lg text-white font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 ${viewerState ? 'pointer-events-none' : ''}`}
                                    onClick={() => viewerSDK(version.urn)}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => downloadFile(version.urn, version.object_key)}
                                    className="px-6 text-white m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
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
                                    className={`px-6 m-1 py-3 text-lg font-medium bg-red-500 rounded-lg transition-all duration-300 hover:bg-red-400 hover:scale-105 shadow-lg hover:shadow-red-400/50 text-white ${archiveStatus ? 'opacity-30 pointer-events-none' : ''}`}
                                >
                                    Rollback
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            </div>
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
                                    onClick={() => {
                                        setConfirmModule(false);
                                        setPassword('');
                                    }}
                                    className={`px-6 m-1 py-3 text-lg font-medium bg-red-500 rounded-lg transition-all duration-300 hover:bg-red-400 hover:scale-105 shadow-lg hover:shadow-red-400/50 text-white ${archiveStatus ? 'opacity-30 pointer-events-none' : ''}`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {(viewerState) && (
                <>
                    <div className="bg-indigo-200 dark:bg-slate-900 fixed inset-0 flex-col items-center justify-center w-full h-full max-w-[900px] max-h-[600px] border border-slate-700/50 m-auto rounded-3xl p-8">
                        <div className="w-full h-full max-w-[850px] max-h-[500px] relative border border-slate-700/50 rounded-lg overflow-hidden">
                            <div id="forgeViewer" className="w-full h-full"></div>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            <button
                                id="viewerBackButton"
                                onClick={() => viewSDK()}
                                className="px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                            >
                                Back
                            </button>
                            {itemTranslating && (
                                <div className="text-white">Processing file...</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default withAuth(Home);
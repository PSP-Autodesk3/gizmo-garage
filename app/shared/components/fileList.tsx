"use client";

// React
import { useEffect } from "react";

// Interfaces
import { File } from "@/app/shared/interfaces/file";

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Other
import { useRouter } from "next/navigation";

export default function FileList({ files }: { files: File[] }) {
    const router = useRouter();

    useEffect(() => {
        if (files) {
            files.forEach(file => {
                // Get URN of file
                let urn: string | null = null;
                try {
                    const retrieveUrn = async () => {
                        const getUrn = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/versions/latestVersion`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ bucket_id: file.bucket_id }),
                        });
                        const data = await getUrn.json();
                        console.log(data);
                        urn = data.urn;
                    }
                    retrieveUrn().then(() => {
                        if (urn) {
                            getManifest(urn);
                        }
                    });
                }
                catch (error) {
                    console.log("Thumbnail not found");
                    return;
                }
                

                const getManifest = async (urn: string) => {
                    const returnedUrn = btoa(urn);
                    const token = sessionStorage.getItem("token");
                    const getThumbnail = async () => {
                        const response = await fetch (`https://developer.api.autodesk.com/modelderivative/v2/designdata/${returnedUrn}/thumbnail`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                        const data = await response.blob();
                        file.thumbnail = data;
                    }
                    getThumbnail();
                }
            });
            // Temp fix
            const reload = sessionStorage.getItem("reload");
            if (reload === "yes") {
                sessionStorage.setItem("reload", "no");
                location.reload();
            }
        }
    }, [files, router]);

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!files ? (
                <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                    <Skeleton width={100} height={100} style={{ margin: '5px' }} className="bg-red-500" />
                </SkeletonTheme>
            ) : (
                Array.isArray(files) && files.length > 0 && (
                    files.map((file) => (
                        <div key={file.object_id}>
                            <button
                                className="text-slate-900 dark:text-slate-200 bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-400/50 dark:hover:bg-slate-700 transition-colors duration-200 rounded-lg text-xl border border-slate-700/50 my-4 px-4 py-2"
                                onClick={() => {router.push(`/item/${file.object_id}`);}}
                            >   
                              <div className="flex flex-col">
                              {file.thumbnail? (
                                        <img 
                                            src={URL.createObjectURL(file.thumbnail)} 
                                            alt="Thumbnail" 
                                            className="w-full h-auto mb-2 rounded-lg"
                                        />
                                    ) : (
                                        <div>
                                            <div className="flex flex-col my-2 animate-pulse">
                                                <div className="h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-400 dark:bg-slate-700 rounded-lg w-1/2"></div>
                                            </div>
                                        </div>
                                    )}
                                <div className="flex flex-row">
                                  <svg className="w-5 h-5 text-slate-900 dark:text-slate-200 flex-shrink-0 mt-1 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                  </svg>
                                  {file.name}
                                </div>
                                {file.archived ? (
                                    <span className="text-sm text-red-500">Archived</span>
                                ) : (<></>)}
                                <span className="text-sm">{file.dateOfCreation.toLocaleDateString()}</span>
                                <div className='flex flex-wrap max-w-full'>
                                    {Array.isArray(file.tags) && file.tags.length > 0 && (
                                        file.tags.map((tag, index) => (
                                            <span key={index} className='rounded-full m-1 p-1 text-xs bg-blue-600 self-center'>
                                                {tag.tag}
                                            </span>
                                        ))
                                    )}
                                </div>
                              </div>
                            </button>
                        </div>
                    ))
                ))}
        </div>
    );
}
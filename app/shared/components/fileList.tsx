"use client";

// Interfaces
import { File } from "@/app/shared/interfaces/file";

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


export default function FileList({ files }: { files: File[] }) {
    console.log("FileList", files);
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!files ? (
                <>
                    <div>
                        <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                            <Skeleton width={100} height={100} style={{ margin: '5px' }} />
                        </SkeletonTheme>
                    </div>
                </>
            ) : (
                Array.isArray(files) && files.length > 0 && (
                    files.map((file, index) => (
                        <div key={file.object_id}>
                            <button
                                key={index}
                                className="bg-slate-900 rounded-lg text-xl my-10 px-10 py-2 flex flex-col"
                                onClick={() => { }}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold">{file.name}</span>
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
"use client";

// Interfaces
import { File } from "@/app/shared/interfaces/file";

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function FileList({ files }: { files: File[] }) {
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!files ? (
                <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                    <Skeleton width={100} height={100} style={{ margin: '5px' }} />
                </SkeletonTheme>
            ) : (
                Array.isArray(files) && files.length > 0 && (
                    files.map((file) => (
                        <div key={file.object_id}>
                            <button
                                className="bg-slate-900 w-full rounded-lg text-xl my-4 px-4 py-2 gap-2 items-center flex"
                                onClick={() => { }}
                            >
                                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                {file.name}
                            </button>
                            {Array.isArray(file.tags) && file.tags.length > 0 && (
                                file.tags.map((tag) => (
                                  <span className='rounded-full m-2 p-2 bg-blue-600 self-center' key={tag.tag_id}>
                                    {tag.tag}
                                  </span>
                                ))
                              )}
                        </div>
                    ))
                ))}
        </div>
    );
}
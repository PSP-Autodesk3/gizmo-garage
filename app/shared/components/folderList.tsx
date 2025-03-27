"use client";

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

// Other
import { usePathname } from 'next/navigation';
import Link from "next/link";

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function FolderList({ folders }: { folders: Folder[] }) {
    const pathname = usePathname();
        
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!folders ? (
                <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                    <Skeleton width={600} height={125} count={4} style={{ marginBottom: '16px' }} />
                </SkeletonTheme>
            ) : (
                Array.isArray(folders) && folders.length > 0 && (
                    folders.map((folder) => (
                        <div key={folder.folder_id} className="flex flex-col">
                            <Link
                                className="bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-400/50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition-colors duration-200 rounded-lg text-xl my-4 px-4 py-2 gap-2 border border-slate-700/50 items-center"
                                href={`${pathname}/${folder.name.replace(/ /g, '%20')}`}
                                onClick={() => sessionStorage.setItem("reload", "yes")}
                            >
                                <svg className="w-5 h-5 text-slate-900 dark:text-slate-200 flex-shrink-0" 
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />

                                </svg>
                                {folder.name}
                                <div className='flex flex-wrap max-w-full'>
                                    {Array.isArray(folder.tags) && folder.tags.length > 0 && (
                                        folder.tags.map((tag) => (
                                            <span className='rounded-full bg-indigo-700 text-slate-200 dark:text-slate-200 text-sm px-4 py-1 items-center text-center mt-2 mb-2 mr-2' key={tag.tag_id}>
                                                {tag.tag}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))
                ))}
        </div>
    );
}
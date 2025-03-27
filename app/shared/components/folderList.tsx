"use client";

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

// Other
import { usePathname } from 'next/navigation';
import Link from "next/link";

export default function FolderList({ folders }: { folders: Folder[] }) {
    const pathname = usePathname();

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {folders && (
                Array.isArray(folders) && folders.length > 0 && (
                    folders.map((folder) => (
                        <div key={folder.folder_id} className="flex flex-col">
                            <Link
                                className="bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-400/50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition-colors duration-200 rounded-lg text-xl my-4 px-4 py-2 gap-2 border border-slate-700/50"
                                href={`${pathname}/${folder.name.replace(/ /g, '%20')}`}
                                onClick={() => sessionStorage.setItem("reload", "yes")}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-slate-900 dark:text-slate-200 flex-shrink-0 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        {folder.name}
                                    </div>
                                    <div className='flex flex-wrap max-w-full mt-2'>
                                        {Array.isArray(folder.tags) && folder.tags.length > 0 && (
                                            folder.tags.map((tag) => (
                                                <span className='rounded-full bg-indigo-700 text-slate-200 dark:text-slate-200 text-sm px-3 py-0.5 items-center text-center mr-2 mb-1' key={tag.tag_id}>
                                                    {tag.tag}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ))}
        </div>
    );
}